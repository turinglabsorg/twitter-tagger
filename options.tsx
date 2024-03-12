import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"

function OptionsIndex() {
    const [account, setAccount] = useState("")
    const [isLogged, setLogged] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)
    useEffect(() => {
        const initComponent = async () => {
            const storage = new Storage()
            const logged = await storage.get("logged")
            console.log("Is user logged?", logged)
            const session = await storage.get("session")
            console.log("There is session?", session)
            if (logged !== undefined) {
                setLogged(true)
                setAccount(logged)
            }
            const url = new URL(window.location.href)
            const loggedAs = url.searchParams.get("loggedAs")
            console.log("Logged as", loggedAs)
            if (loggedAs !== null) {
                setLogged(true)
                setAccount(loggedAs)
                await storage.set("logged", loggedAs)
                setIsRedirecting(true)
                setTimeout(function () {
                    window.location.href = "https://wallet.mego.tools/auth/google?origin=" + window.location.href + "&message=" + loggedAs.toLowerCase() + ":twittertagger:session"
                }, 100)
            }
            const signature = url.searchParams.get("signature")
            if (signature !== null) {
                await storage.set("session", signature)
            }
        }
        initComponent().catch(console.error);
    }, [])
    function redirectToGoogleWallet() {
        console.log("https://wallet.mego.tools/auth/google?origin=" + window.location.href)
        setIsRedirecting(true)
        setTimeout(function () {
            window.location.href = "https://wallet.mego.tools/auth/google?origin=" + window.location.href
        }, 100)
    }
    function redirectToAppleWallet() {
        console.log("https://wallet.mego.tools/auth/apple?origin=" + window.location.href)
        setTimeout(function () {
            window.location.href = "https://wallet.mego.tools/auth/apple?origin=" + window.location.href
        }, 100)
    }
    function logout() {
        const storage = new Storage({
            copiedKeyList: ["shield-modulation", "logged"]
        })
        storage.set("logged", null)
        setLogged(false)
        setAccount("")
    }
    return (
        <div>
            <h1>
                Welcome to Twitter tagger extension!
            </h1>
            {!isLogged && !isRedirecting &&
                <div>
                    <button onClick={redirectToGoogleWallet}>ENTER USING GOOGLE</button><br></br>
                    <button onClick={redirectToAppleWallet}>ENTER USING APPLE</button><br></br>
                </div>
            }
            {isRedirecting &&
                <div>
                    <p>Redirecting to wallet...</p>
                </div>
            }
            {isLogged &&
                <div>
                    <p>Welcome back {account}!</p>
                    <button onClick={logout}>LOGOUT</button>
                </div>
            }
        </div>
    )
}

export default OptionsIndex