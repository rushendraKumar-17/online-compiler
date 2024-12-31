import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import repositoryModel from "../models/repositoryModel.js";
import fileModel from "../models/fileModel.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runCode = async (req, res) => {
  const { code, language } = req.body;
  console.log(language);
  console.log(code);
  switch (language) {
    case "python": {
      const codesDir = path.join(__dirname, "codes");

      const filePath = path.join(codesDir, "temp.py");
      console.log(filePath);

      fs.writeFileSync(filePath, code);

      const command = `python3 "${filePath}"`;
      exec(command, (error, stdout, stderr) => {
        fs.unlinkSync(filePath);

        if (error) {
          return res.status(500).json({ error: stderr || error.message });
        }
        return res.json({ output: stdout });
      });
      break;
    }

    case "java": {
      const codesDir = path.join(__dirname, "codes");
      if (!fs.existsSync(codesDir)) {
        fs.mkdirSync(codesDir, { recursive: true }); // Ensure the directory exists
      }

      const filePath = path.join(codesDir, "Temp.java");
      fs.writeFileSync(filePath, code);

      const command = `javac Temp.java && java Temp`;
      exec(command, { cwd: codesDir }, (error, stdout, stderr) => {
        try {
          fs.unlinkSync(filePath);
          const classFile = path.join(codesDir, "Temp.class");
          if (fs.existsSync(classFile)) {
            fs.unlinkSync(classFile);
          }
        } catch (cleanupError) {
          console.error("Cleanup Error:", cleanupError.message);
        }

        if (error) {
          return res.status(500).json({ error: stderr || error.message });
        }
        return res.json({ output: stdout });
      });
      break;
    }

    case "javascript": {
      try {
        const result = eval(code);
        return res.json({ output: result });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    case "cpp": {
      return res
        .status(400)
        .json({ error: "C++ execution is not implemented yet" });
    }

    default: {
      return res
        .status(400)
        .json({ error: "This language is not supported yet" });
    }
  }
};

export const saveCode = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  console.log(id);
  console.log(code);
  try {
    const file = await fileModel.findById(id);
    file.content = code;
    file.save();
    return res.status(200).send("File saved successfully");
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
export default { runCode, saveCode };
