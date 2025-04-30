export default function WalletPage({ params }: { params: { address: string } }) {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold">Wallet Analysis</h1>
      <p>Address: {params.address}</p>
    </div>
  )
}
