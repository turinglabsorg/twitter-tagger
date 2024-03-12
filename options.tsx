import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import logo from "data-base64:~assets/icon.png"

function OptionsIndex() {
    const [account, setAccount] = useState("")
    const [isLogged, setLogged] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [color, setColor] = useState("black")

    useEffect(() => {
        const initComponent = async () => {
            const storage = new Storage()
            const logged = await storage.get("logged")
            console.log("Is user logged?", logged)
            const session = await storage.get("session")
            console.log("There is session?", session)
            const color = await storage.get("color")
            console.log("Color", color)
            if (color !== undefined) {
                setColor(color)
            }
            if (logged !== undefined && logged !== null && session !== undefined && session !== null) {
                setLogged(true)
                setAccount(logged)
            }
            const url = new URL(window.location.href)
            const loggedAs = url.searchParams.get("loggedAs")
            console.log("Mego wallet callback", loggedAs)
            if (loggedAs !== null) {
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
    let lastChanged = 0
    let lastColor = ""
    let interval
    async function changeColor(color) {
        lastChanged = Date.now()
        if (interval === undefined) {
            interval = setInterval(async function () {
                const now = Date.now()
                const elapsed = now - lastChanged
                setColor(color)
                if (elapsed > 1500 && lastColor !== color) {
                    lastColor = color
                    const storage = new Storage()
                    await storage.set("color", color)
                    console.log("Color changed to", color)
                    clearInterval(interval)
                }
            }, 200)
        }
    }
    return (
        <div style={{
            textAlign: "center",
            padding: "40vh",
            fontFamily: "Monospace",
            fontSize: "12px"
        }}>
            <h1>
                <img src={logo} style={{width: "120px"}} /><br></br>
                Welcome to<br></br>Twitter tagger!
            </h1>
            {!isLogged && !isRedirecting &&
                <div>
                    <button onClick={redirectToGoogleWallet} style={{ width: "200px", fontFamily: "Monospace" }}>ENTER USING GOOGLE</button><br></br>
                    <button onClick={redirectToAppleWallet} style={{ width: "200px", marginTop: "10px", fontFamily: "Monospace" }}>ENTER USING APPLE</button><br></br>
                </div>
            }
            {isRedirecting &&
                <div>
                    <p>Entering, please wait...</p>
                </div>
            }
            {isLogged &&
                <div>
                    <p>Welcome back {account}!</p>
                    Set base highlight color: <br></br><br></br>
                    <input type="color" value={color} onChange={e => changeColor(e.target.value)} ></input><br></br><br></br>
                    <button onClick={logout} style={{ width: "200px", marginTop: "10px", fontFamily: "Monospace" }}>LOGOUT</button>
                </div>
            }
        </div>
    )
}

export default OptionsIndex