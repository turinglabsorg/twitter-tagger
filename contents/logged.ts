import type { PlasmoCSConfig } from "plasmo"

import { relayMessage } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
    matches: ["https://www.twitter.com/*", "https://twitter.com/*"] // Only relay messages from this domain
}

relayMessage({
    name: "logged"
})