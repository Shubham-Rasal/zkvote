import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Election = {
  id: string
  name: string
  votes: number
  winner: string
  date: string
}

const elections: Election[] = [
  { id: '1', name: '2024 Presidential Election', votes: 150000000, winner: 'John Doe', date: '2024-11-03' },
  { id: '2', name: '2024 Senate Race', votes: 80000000, winner: 'Jane Smith', date: '2024-11-03' },
  { id: '3', name: '2023 Gubernatorial Election', votes: 5000000, winner: 'Bob Johnson', date: '2023-11-07' },
]

export function VotingDashboardComponent() {
  const [ethereumAddress, setEthereumAddress] = useState('')
  const [electionId, setElectionId] = useState('')

  const checkEligibility = () => {
    // This is where you would implement the actual eligibility check
    console.log(`Checking eligibility for address ${ethereumAddress} in election ${electionId}`)
    // For now, we'll just log the information
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Voting Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Check Eligibility</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Check Voting Eligibility</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      placeholder="Ethereum Address"
                      value={ethereumAddress}
                      onChange={(e) => setEthereumAddress(e.target.value)}
                    />
                    <Input
                      placeholder="Election ID"
                      value={electionId}
                      onChange={(e) => setElectionId(e.target.value)}
                    />
                    <Button onClick={checkEligibility}>Check</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => (
              <Card key={election.id}>
                <CardHeader>
                  <CardTitle>{election.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Votes:</strong> {election.votes.toLocaleString()}</p>
                  <p><strong>Winner:</strong> {election.winner}</p>
                  <p><strong>Date:</strong> {election.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}