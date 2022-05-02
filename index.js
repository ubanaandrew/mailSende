const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const { gmail } = require("googleapis/build/src/apis/gmail");
const app = express();

const PORT = 3000;

app.use(express.static("public"));

//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./attachments");
    },
    filename: function (req, file, callback) {
        callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
});

// Middleware to get a single attachment
const attachmentUpload = multer({
    storage: Storage,
}).single("attachment");

// Route to handle sending mails
app.post("/send_email", (req, res) => {
    attachmentUpload(req, res, async function (error) {
        if (error) {
            return res.send("Error uploading file");
        } else {
            // Pulling out the form data from the request body
            const recipient = req.body.email;
            const mailSubject = req.body.subject;
            const mailBody = req.body.message;
            const attachmentPath = req.file.path;

            // Connecting to gmail service
            let transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.example.com",
                port: 587,
                secure: false,
                auth: {
                    user: "ubanaandrew@gmail.com",
                    pass: "Gloflatmail02",
                },

            });

            // Mail options
            let mailOptions = {
                from: "ubanaandrew@gmail.com",
                to: [recipient],
                subject: mailSubject,
                text: mailBody,
                attachments: [
                    {
                        path: attachmentPath,
                    },
                ],
            };

            try {
                // Send email
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        // failed block
                        console.log(error);
                    } else {
                        // Success block
                        console.log("Email sent: " + info.response);
                        return res.redirect("/success.html");
                    }
                });
            } catch (error) {
                console.log(error);
                // return res.send("There's an error");
            }
        }
    });
});

app.get("/", (req, res) => {
    res.sendFile("/index.html");
});

app.listen(PORT, () => {
    console.log(`Server is currently 🏃‍♂️ on port ${PORT}`);
});