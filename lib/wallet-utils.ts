/**
 * Checks if the Phantom wallet is installed and available
 */
export function isPhantomInstalled(): boolean {
  const win = window as any
  return win?.solana?.isPhantom || false
}

/**
 * Gets the connected wallet's public key if available
 */
export async function getConnectedWallet(): Promise<string | null> {
  try {
    const win = window as any
    if (!win?.solana?.isPhantom) {
      return null
    }

    // If already connected, return the public key
    if (win.solana.isConnected) {
      return win.solana.publicKey?.toString() || null
    }

    return null
  } catch (error) {
    console.error("Error getting connected wallet:", error)
    return null
  }
}

/**
 * Connects to the Phantom wallet
 */
export async function connectToPhantom(): Promise<string | null> {
  try {
    const win = window as any
    if (!win?.solana?.isPhantom) {
      throw new Error("Phantom wallet not installed")
    }

    const response = await win.solana.connect()
    return response.publicKey.toString()
  } catch (error) {
    console.error("Error connecting to Phantom:", error)
    throw error
  }
}

/**
 * Disconnects from the Phantom wallet
 */
export async function disconnectFromPhantom(): Promise<void> {
  try {
    const win = window as any
    if (win?.solana?.isPhantom) {
      await win.solana.disconnect()
    }
  } catch (error) {
    console.error("Error disconnecting from Phantom:", error)
    throw error
  }
}
