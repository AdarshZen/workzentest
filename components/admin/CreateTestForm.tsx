"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type QuestionType = 'mcq' | 'coding' | 'text'

interface Question {
  id: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer?: string
  points: number
  languages?: string[]
  templateCode?: string
  testCases?: Array<{input: string, output: string}>
}

export function CreateTestForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [testData, setTestData] = useState({
    testName: '',
    companyName: '',
    duration: 60,
    instructions: '',
    test_type: 'mixed'
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Omit<Question, 'id'>>({ 
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    languages: ['javascript'],
    templateCode: '',
    testCases: [{input: '', output: ''}]
  })

  const handleAddQuestion = () => {
    if (!currentQuestion.question) {
      toast({
        title: 'Error',
        description: 'Question text is required',
        variant: 'destructive',
      })
      return
    }

    if (currentQuestion.type === 'mcq' && !currentQuestion.correctAnswer) {
      toast({
        title: 'Error',
        description: 'Please select a correct answer',
        variant: 'destructive',
      })
      return
    }
    
    if (currentQuestion.type === 'coding' && (!currentQuestion.languages?.length || !currentQuestion.templateCode)) {
      toast({
        title: 'Error',
        description: 'At least one programming language and template code are required for coding questions',
        variant: 'destructive',
      })
      return
    }

    setQuestions([...questions, { ...currentQuestion, id: Date.now().toString() }])
    setCurrentQuestion({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      languages: ['javascript'],
      templateCode: '',
      testCases: [{input: '', output: ''}]
    })
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one question',
        variant: 'destructive',
      })
      return
    }

    // Log the data being sent to help debug
    console.log('Submitting test data:', {
      ...testData,
      questionCount: questions.length
    })

    setIsLoading(true)
    
    try {
      // Format payload to match database column names exactly
      const payload = {
        test_name: testData.testName,
        company_name: testData.companyName,
        duration: testData.duration,
        instructions: testData.instructions,
        test_type: testData.test_type,
        questions: questions.map(q => ({
          question_text: q.question,
          question_type: q.type,
          options: q.options,
          correct_answer: q.correctAnswer,
          points: q.points,
          languages: q.languages,
          template_code: q.templateCode,
          test_cases: q.testCases
        })),
      };
      
      console.log('Request payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch('/api/admin/test-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        // Try to get more detailed error information
        const errorData = await response.json().catch(() => null);
        console.error('Server response error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        if (errorData?.error) {
          throw new Error(`Failed to create test: ${errorData.error}`);
        } else {
          throw new Error(`Failed to create test: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json()
      
      toast({
        title: 'Success!',
        description: 'Test created successfully',
      })
      
      router.push(`/admin/test-sessions/${data.id}`)
    } catch (error) {
      console.error('Error creating test:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create test',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Create New Test</h2>
        <p className="text-gray-500">Fill in the details below to create a new test</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              placeholder="e.g. Frontend Developer Assessment"
              value={testData.testName}
              onChange={(e) => setTestData({...testData, testName: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Your company name"
              value={testData.companyName}
              onChange={(e) => setTestData({...testData, companyName: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={testData.duration}
              onChange={(e) => setTestData({...testData, duration: parseInt(e.target.value) || 60})}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            placeholder="Provide instructions for the test takers"
            rows={4}
            value={testData.instructions}
            onChange={(e) => setTestData({...testData, instructions: e.target.value})}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Questions</h3>
            <span className="text-sm text-gray-500">{questions.length} questions added</span>
          </div>
          
          <div className="space-y-4 border rounded-lg p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question {questions.length + 1}</Label>
                <Textarea
                  placeholder="Enter your question"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                  rows={3}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={currentQuestion.type}
                    onValueChange={(value) => setCurrentQuestion({
                      ...currentQuestion, 
                      type: value as QuestionType,
                      options: value === 'mcq' ? ['', '', '', ''] : undefined,
                      correctAnswer: ''
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="text">Text Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion, 
                      points: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
              </div>
              
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === option}
                          onChange={() => setCurrentQuestion({
                            ...currentQuestion, 
                            correctAnswer: option
                          })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options!]
                            newOptions[index] = e.target.value
                            setCurrentQuestion({
                              ...currentQuestion,
                              options: newOptions,
                              correctAnswer: currentQuestion.correctAnswer === option ? e.target.value : currentQuestion.correctAnswer
                            })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentQuestion.type === 'coding' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Programming Languages</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {currentQuestion.languages?.map((lang, idx) => (
                        <Badge key={idx} className="px-2 py-1">
                          {lang}
                          <X 
                            className="ml-1 h-3 w-3 cursor-pointer" 
                            onClick={() => {
                              const newLangs = [...(currentQuestion.languages || [])].filter((_, i) => i !== idx);
                              setCurrentQuestion({
                                ...currentQuestion,
                                languages: newLangs.length ? newLangs : ['javascript']
                              });
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) => {
                        if (!currentQuestion.languages?.includes(value)) {
                          setCurrentQuestion({
                            ...currentQuestion, 
                            languages: [...(currentQuestion.languages || []), value]
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="ruby">Ruby</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="swift">Swift</SelectItem>
                        <SelectItem value="kotlin">Kotlin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Template Code</Label>
                    <Textarea
                      placeholder="Provide starter code for the candidate"
                      rows={5}
                      value={currentQuestion.templateCode}
                      onChange={(e) => setCurrentQuestion({
                        ...currentQuestion, 
                        templateCode: e.target.value
                      })}
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Test Cases</Label>
                    <div className="space-y-3">
                      {currentQuestion.testCases?.map((testCase, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                          <div>
                            <Label className="text-xs">Input</Label>
                            <Textarea
                              placeholder="Test input"
                              rows={2}
                              value={testCase.input}
                              onChange={(e) => {
                                const newTestCases = [...currentQuestion.testCases!]
                                newTestCases[index] = {
                                  ...newTestCases[index],
                                  input: e.target.value
                                }
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  testCases: newTestCases
                                })
                              }}
                              className="font-mono text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Expected Output</Label>
                            <Textarea
                              placeholder="Expected output"
                              rows={2}
                              value={testCase.output}
                              onChange={(e) => {
                                const newTestCases = [...currentQuestion.testCases!]
                                newTestCases[index] = {
                                  ...newTestCases[index],
                                  output: e.target.value
                                }
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  testCases: newTestCases
                                })
                              }}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentQuestion({
                            ...currentQuestion,
                            testCases: [...(currentQuestion.testCases || []), {input: '', output: ''}]
                          })
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Test Case
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {questions.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Added Questions</h4>
                <div className="space-y-2">
                  {questions.map((q, index) => (
                    <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{index + 1}.</span>
                          <span className="truncate">{q.question || 'Untitled question'}</span>
                          <Badge variant={q.type === 'mcq' ? 'default' : q.type === 'coding' ? 'secondary' : 'outline'}>
                            {q.type === 'mcq' ? 'Multiple Choice' : q.type === 'coding' ? `Coding (${q.languages?.join(', ') || 'N/A'})` : 'Text'}
                          </Badge>
                          <Badge variant="secondary">
                            {q.points} {q.points === 1 ? 'point' : 'points'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/test-sessions')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || questions.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Test'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
