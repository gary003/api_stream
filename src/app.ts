import express from "express"
import stream from "stream"
import { promisify } from "util"
import fs from "fs-extra"

const port = 8080

// Defining pipelineAsync method
const pipelineAsync = promisify(stream.pipeline)

const app = express()

const fakeUpload = (req: any, res: any, next: () => void) => {
  const fakeSource = function* () {
    yield { name: "azerty" }
    yield { name: "qwerty" }
    yield { name: "poiuyt" }
    yield { name: "wxcvbn" }
  }

  req.sourceData = stream.Readable.from(fakeSource())
  // req.sourceData = stream.Readable.from("sourceString".split(""))
  // req.sourceData = fs.createReadStream("./src/files/testFile.txt", { highWaterMark: 8 })

  return next()
}

app.get("/file", fakeUpload, async (req: any, res) => {
  // console.log(req.sourceData)

  const transform = async function* (source: any) {
    for await (const value of source.sourceData) {
      console.log(`chunk: ${value}`)
      yield JSON.stringify(value)
    }
  }

  try {
    await pipelineAsync(req, transform, res.status(250))
    console.log("pipeline ended")
    return true
  } catch (errorPipeline) {
    console.error(errorPipeline)
    return res.status(500).send(errorPipeline)
  }
})

app.listen(port, () => console.log(`Listening on : ${port}`))
