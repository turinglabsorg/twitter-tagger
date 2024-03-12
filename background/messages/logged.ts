import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage()
    const logged = await storage.get("logged")
    res.send({
        message: logged
    })
}

export default handler