import type { PlasmoCSConfig } from "plasmo"
import { sendToBackgroundViaRelay } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
    matches: ["https://twitter.com/*", "https://x.com/*", "https://www.twitter.com/*", "https://www.x.com/*"],
    all_frames: true,
    world: "MAIN"
}
let accounts = {}
let tags = {}

async function selectProfile(profile) {
    await sendToBackgroundViaRelay({
        name: "save",
        body: {
            profile: profile
        }
    })
}

try {
    setInterval(async function () {
        const logged = await sendToBackgroundViaRelay({
            name: "logged"
        })
        if (logged !== null && logged.message !== undefined && logged.message !== "" && logged.message.indexOf("0x") !== -1) {
            const saved = await sendToBackgroundViaRelay({
                name: "get"
            })
            console.log("Saved tags", saved.message)
            for(let k in saved.message) {
                const tag = saved.message[k]
                tags[tag.key] = tag.value
            }
            const account = logged.message
            console.log("Logged as", account)
            const spans = document.querySelectorAll("span")
            for (let k in spans) {
                if (spans[k].innerText !== undefined && spans[k].innerText.indexOf("@") === 0) {
                    // console.log("Found account:", spans[k].innerText)
                    const account = spans[k].innerText.split("|")[0].trim()
                    spans[k].style.color = "red"
                    spans[k].style.fontWeight = "bold"
                    if (accounts[account] === undefined) {
                        accounts[account] = account
                    }
                    spans[k].innerText = accounts[account] + " | " + (tags[account] !== undefined ? tags[account] : "No tag")
                    spans[k].onmouseover = function () {
                        console.log("Hover account", account)
                        selectProfile(account)
                    }
                }
            }
        }
    }, 1000)
} catch (e) {
    console.error("Error", e)
}