import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const storage = new Storage()
    const logged = await storage.get("logged")
    console.log("Received message", req.body, "Logged", logged)
    try {
        await storage.set("profile", req.body.profile)
    } catch (e) {
        res.send({
            message: e.message
        })
    }
}

export default handler