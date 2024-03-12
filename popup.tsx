import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import axios from "axios"

function IndexPopup() {
  const [isLogged, setLogged] = useState(false)
  const [account, setAccount] = useState("")
  const [tag, setTag] = useState("")
  const [result, setResult] = useState("")
  const [profileSelected, setProfileSelected] = useState("")
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

  async function resetProfile() {
    const storage = new Storage()
    storage.set("profile", "")
  }
  let lastProfile = ""
  setInterval(async function () {
    const storage = new Storage()
    const profile = await storage.get("profile")
    if (lastProfile !== profile) {
      for (let k in savedTags) {
        const tag = savedTags[k]
        if (tag.key === profile) {
          setTag(tag.value)
        }
      }
    }
    lastProfile = profile
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
        width: "200px",
        fontFamily: "Helvetica"
      }}>
      <h2>
        Twitter tagger
        <div onClick={openOptionPage} style={{ position: "fixed", top: "10px", right: "10px", cursor: "pointer" }}>⚙️</div>
      </h2>
      {isLogged ? "Welcome back " + account.substring(0, 6) + "!" : "Please sign up to use this extension."}
      <br></br><br></br>
      {!isLogged &&
        <button onClick={openOptionPage}>SIGN UP</button>
      }
      {isLogged &&
        <div>
          You have saved {savedTags.length} tags.<br></br><hr></hr>

          {profileSelected.length > 0 &&
            <div>
              <div id="profileSelector">
                Profile: {profileSelected}
                <span onClick={resetProfile} style={{ cursor: "pointer" }}>🗑️</span>
              </div>
              <input type="text" value={tag} placeholder="Tag" style={{ width: "192px" }} onChange={e => setTag(e.target.value)} />
              <button onClick={saveTag} style={{ width: "100%" }} id="save">Save</button>
              <div style={{ width: "100%", textAlign: "center", marginTop: "10px" }}>{result}</div>
            </div>
          }
          {profileSelected.length === 0 &&
            <div style={{ width: "100%", textAlign: "center", marginTop: "15px" }}>Hover an username to start.</div>
          }
        </div>
      }
    </div>
  )
}

export default IndexPopup
