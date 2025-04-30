import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WalletPageProps {
  params: {
    address: string
  }
}

export default function WalletPage({ params }: WalletPageProps) {
  const { address } = params

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Wallet Analysis</h1>
      <p className="text-muted-foreground">Detailed analysis for wallet {address}</p>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Address: {address}</p>
        </CardContent>
      </Card>
    </div>
  )
}
