import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import axios from "axios"

function IndexPopup() {
  const [isLogged, setLogged] = useState(false)
  const [account, setAccount] = useState("")
  const [tag, setTag] = useState("")
  const [result, setResult] = useState("")
  const [profileSelected, setProfileSelected] = useState("NO PROFILE SELECTED")
  const [savedTags, setSavedTags] = useState([])

  useEffect(() => {
    const initComponent = async () => {
      const storage = new Storage()
      const logged = await storage.get("logged")
      console.log("Is user logged?", logged)
      if (logged !== undefined) {
        setLogged(true)
        setAccount(logged)
        const saved = await axios.get("https://api.umi.tools/store/topic/twittertagger/" + logged)
        console.log("Saved", saved.data)
        await storage.set("tags", saved.data)
        setSavedTags(saved.data)
      }
    }
    initComponent().catch(console.error);
  }, [])

  function openOptionPage() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  }

  setInterval(async function () {
    const storage = new Storage()
    const profile = await storage.get("profile")
    setProfileSelected(profile)
  }, 100)

  async function saveTag() {
    try {
      const storage = new Storage()
      const logged = await storage.get("logged")
      const profile = await storage.get("profile")
      const session = await storage.get("session")
      const saved = await axios.post("https://api.umi.tools/store/put", {
        "address": logged,
        "topic": "twittertagger",
        "key": profile,
        "value": tag,
        "signature": session,
        "session": "Y"
      })
      console.log("Saved", saved.data)
      setResult(saved.data.message)
      const updated = await axios.get("https://api.umi.tools/store/topic/twittertagger/" + logged)
      await storage.set("tags", updated.data)
      setSavedTags(updated.data)
      setTimeout(function () {
        setResult("")
      }, 2000)
    } catch (e) {
      console.error("Error", e)
      setResult("Error")
    }
  }
  return (
    <div
      style={{
        padding: "10px 20px 25px 10px",
        width: "200px"
      }}>
      <h2>
        Twitter tagger
      </h2>
      {isLogged ? "Welcome back " + account.substring(0, 6) + "!" : "Please sign up to use this extension."}
      <br></br><br></br>
      {!isLogged &&
        <button onClick={openOptionPage}>SIGN UP</button>
      }
      {isLogged &&
        <div>
          You have saved {savedTags.length} tags.<br></br><hr></hr>
          <div id="profileSelector">{profileSelected}</div>
          <input type="text" placeholder="Tag" onChange={e => setTag(e.target.value)} /><br></br>
          <button onClick={saveTag} id="save">Save</button>
          <div>{result}</div>
        </div>
      }
    </div>
  )
}

export default IndexPopup
