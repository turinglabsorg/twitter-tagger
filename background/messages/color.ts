import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage()
    const color = await storage.get("color")
    res.send({
        message: color
    })
}

export default handler