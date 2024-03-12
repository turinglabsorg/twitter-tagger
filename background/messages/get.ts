import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage()
    const tags = await storage.get("tags")
    res.send({
        message: tags
    })
}

export default handler