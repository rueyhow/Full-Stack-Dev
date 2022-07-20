const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const Ticket = require("../models/Ticket").Ticket;
const Response = require("../models/Ticket").Response;
const Permissions = require("../models/Ticket").Permissions;
const TicketImages = require("../models/Ticket").TicketImages;
const os = require("os");
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const mySQLDB = require('../config/DBConfig');
const fs = require('fs');
const Multer = require('multer');
const fetch = require('node-fetch') 


JSZip = require('jszip') 
// to zip them up 

const micro = require('micro') 
// to serve them


const { Storage } = require('@google-cloud/storage');


// sending request email function
function sendRequest(toEmail, url1, userId, id, name) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        templateId: "d-333db1aa5eb5480d8f9d9895a9dcad12",
        from: `Handy Hand Phone <${process.env.SENDGRID_SENDER_EMAIL}>`,
        personalizations: [
            {
                to: toEmail,
                dynamic_template_data: {
                    sender: name,
                    id: id,
                    url: url1
                },
            },
        ],
    };

    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}
// uploading images to google cloud storage
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        filesize: 20 * 1024 * 1024, // 20 MB MAX
    }
});

let projectId = 'handyhandphone'
let keyfilename = 'driven-rig-356715-94c546ae6ace.json';

const storage = new Storage({
    projectId,
    keyfilename: path.join(__dirname, '../handyhandphone-1075b995e1de.json')
})

const bucket = storage.bucket("handyhandphone");

// actual routes
router.get('/ticketPage', ensureAuthenticated, (req, res) => {
    res.render("ticket/ticket");
});

// submit ticket page
router.post('/ticketPage/:id/:type', async (req, res) => {
    var uid = req.params.id
    var type = req.params.type


    let { message, category } = req.body;
    if (req.user.dataValues.admin == false) {
        let ticket = await Ticket.create({ message: message, type: type, category: category, status: false, userId: uid, assigned: false })

        flashMessage(res, "success", "Ticket submitted successfully")
        res.redirect("back");
    }
    else {
        flashMessage(res, "error", "Admins can not submit tickets")
        res.redirect("back")
    }

});

// reply ticket page
router.get('/replyTicket/:id', ensureAuthenticated, async (req, res) => {

    var PermittedUsers = new Object();

    const userId = req.user.dataValues.id;
    var id = req.params.id;

    const AdminUsers = await User.findAll({ where: { admin: true } })
    const ResponseData = await Response.findAll({ where: { ticketId: id }, include: { model: TicketImages } });
    const ImageData = await TicketImages.findAll();

    for (let permitted of AdminUsers) {

        const userPermitted = await Permissions.findOne({ where: { AdminName: permitted.dataValues.name, TicketID: id } })
        if (permitted.dataValues.name != req.user.dataValues.name) {
            if (!PermittedUsers[permitted.dataValues.name]) PermittedUsers[permitted.dataValues.name] = {};

            if (userPermitted) {
                PermittedUsers[permitted.dataValues.name] = "true";
            }
            else {
                PermittedUsers[permitted.dataValues.name] = "false";
            }
        }


    }
    Ticket.findOne({ where: { ticketId: id } })
        .then(async (data) => {
            var user1 = await User.findByPk(data.userId);
            var TicketData = await Ticket.findOne({ where: { ticketId: id } });
            var PermissionData = await Permissions.findOne({ where: { AdminID: userId, ticketId: id } });

            // test big query
            // var query = `SELECT u.profilePicture AS "profilePic" , u.id AS "userId"  , u.name AS "name" , r.reply AS "reply" , t.base64 AS "img" , r.ticketId AS "ticketId" , u.admin AS "admin"  from users u 
            // inner join responses r on u.id = r.senderId
            // inner join ticketimages t on r.responseId = t.ResponseId
            // where r.ticketId = ${id};`;

            // const results = await mySQLDB.query(query , (results , fields ,error)=>{
            //     if (error) {
            //         return console.log(error.message);
            //       }
            //     else
            //     {
            //         console.log(fields);
            //         mySQLDB.close();
            //     }
            // });

            if (PermissionData) {
                res.render("ticket/replyTicket", { TicketData: TicketData, ResponseData: ResponseData, user1: user1, TicketId: id, AdminUsers: PermittedUsers, PermissionData: PermissionData.id, ImageData: ImageData });
            }
            else {
                res.render("ticket/replyTicket", { TicketData: TicketData, ResponseData: ResponseData, user1: user1, TicketId: id, AdminUsers: PermittedUsers, PermissionData: null, ImageData: ImageData });
            }

        });
})
// reply ticket with response
router.post('/replyTicket/:id', async (req, res) => {
    const userId = req.user.dataValues.id;
    const TicketPermission = await Permissions.findOne({ where: { adminID: userId, TicketID: req.params.id } })
    const TicketStatus = await Ticket.findOne({ where: { ticketId: req.params.id } })
    const User = await Ticket.findAll({ where: { ticketId: req.params.id, userId: userId } })
    const buffer = require('buffer/').Buffer;
    const id = req.headers.referer.split('/')[5];
    console.log(id);
    // check whether user is an admin
    var checkAdmin = false;

    if(req.user.dataValues.admin == true){
        checkAdmin = true;
    }
    if (TicketPermission || User) {
        if (TicketStatus.status == false) {
            let { reply } = req.body;
            Ticket.findOne({ where: { ticketId: id } })
                .then(async (data) => {
                    Response.create({ senderId: userId, reply: reply, ticketId: id  , admin : checkAdmin})
                        .then(async (response) => {
                            if (req.files) {
                                const datalength = req.files.imageFile.length;
                                // var date =  Date.now().toString();
                                // if (datalength == undefined) {
                                //     req.files.imageFile.mv(path.resolve("D:/FSDP/HHP - Full Stack/Full-Stack-Dev/node-main/HandyHandPhone/public/img/responseImages/" + date + req.files.imageFile.name), function (err) { 
                                //     })
                                //     let image = await TicketImages.create({ base64: "/img/responseImages/" + date + req.files.imageFile.name, ResponseId: response.ResponseId })
                                // }
                                // else {
                                //     for (let i = 0; i <= datalength - 1; i++) {
                                //         const img = req.files.imageFile[i];
                                //         const filename = req.files.imageFile[i].name;
                                //         console.log(img, filename)
                                //         img.mv(path.resolve("D:/FSDP/HHP - Full Stack/Full-Stack-Dev/node-main/HandyHandPhone/public/img/responseImages/" + date + filename), function (err) { })
                                //         let image = await TicketImages.create({ base64: "/img/responseImages/" + date + filename, ResponseId: response.ResponseId , TicketId : req.params.id })
                                //     }
                                // }

                                // saving into google cloud storage

                                var date = Date.now().toString();
                                if (datalength == undefined) {
                                    const blob = bucket.file(date + req.files.imageFile.name);
                                    const blobStream = blob.createWriteStream({
                                        resumable: false,
                                        gzip: true,
                                    });

                                    blobStream.on('finish', async () => {
                                        let image = await TicketImages.create({ base64: date + req.files.imageFile.name, ResponseId: response.ResponseId , TicketId : id})
                                        flashMessage(res, "success", "img got")
                                        res.redirect("back");
                                    });
                                    blobStream.end(req.files.imageFile.data);
                                }
                                else {
                                    for (let i = 0; i <= datalength - 1; i++) {
                                        const mainFile = req.files.imageFile[i]
                                        const blob = bucket.file(date + mainFile.name);


                                        const blobStream = blob.createWriteStream({
                                            resumable: false,
                                            gzip: true,
                                        });

                                        blobStream.on('finish', async () => {
                                            let image = await TicketImages.create({ base64: date + mainFile.name, ResponseId: response.ResponseId, TicketId : id })
                                        });
                                        blobStream.end(mainFile.data);

                                    }
                                    flashMessage(res, "success", "img got")
                                    res.redirect("back");

                                }

                            }
                            else {
                                flashMessage(res, "success", "no img")
                                res.redirect("back");
                            }
                            // flashMessage(res, "success", "response successfully sent and ticket has been updated")
                            // res.redirect("back");
                        })
                });
        }
        else {
            flashMessage(res, "error", "Ticket has been closed , this ticket is only for viewing")
            res.redirect("back");
        }

    }
    else {
        flashMessage(res, "error", "You are not authorised to reply to this ticket , please request access from ticket master")
        res.redirect("back");
    }

});

// take up ticket route

router.get('/takeUpTicket/:TicketId', async (req, res) => {
    const TicketId = req.params.TicketId;

    const userId = req.user.dataValues.id;
    // create permission table
    let permission = Permissions.create({ TicketID: TicketId, AdminID: userId, level: 1, AdminName: req.user.dataValues.name });

    // updating ticket assigned status 
    const ticket = await Ticket.findByPk(TicketId);
    ticket.assigned = true;
    await ticket.save();


    flashMessage(res, "success", "Admin ID", userId, " has been assigned ticket number : ", TicketId)
    res.redirect("back");
});


// give permission

router.get('/giveTicketPermission/:name', async (req, res) => {
    var name = req.params.name;
    var id = req.headers.referer.split('/');
    console.log(id[5])
    const admin = await User.findOne({ where: { name: name } })

    const checkPermission = await Permissions.findOne({ where: { AdminID: id[5] } })

    if (checkPermission) {
        flashMessage(res, "error", "Admin already has permission");
        res.redirect("back");
    }
    else {

        let permission = Permissions.create({ TicketID: id[5], AdminID: admin.id, level: 2, AdminName: name });
        flashMessage(res, "success", "Admin is given permission");
        res.redirect("back");
    }

});



router.get('/removeTicketPermission/:name', async (req, res) => {
    var name = req.params.name;
    console.log(name);
    var id = req.headers.referer.split('/');
    var userId = req.user.dataValues.id;
    console.log(id[5])
    const admin = await User.findOne({ where: { name: name } })
    const checkPermission = await Permissions.findOne({ where: { AdminID: admin.id } })

    if (checkPermission) {
        if (checkPermission.level == 1) {
            flashMessage(res, "error", "You cannot remove the permission of the ticket master");
            res.redirect("back");
        }
        else {
            await checkPermission.destroy();
            console.log(checkPermission.level);
            flashMessage(res, "success", "Permission has been removed");
            res.redirect("back");

        }

    }
    else {
        flashMessage(res, "error", "Admin not found");
        res.redirect("back");
    }

});


router.get('/requestAccess', async (req, res) => {
    // ticket id information
    var id = req.headers.referer.split('/')[5];
    var userId = req.user.dataValues.id;

    // finding ticket master information
    const TicketMaster = await Permissions.findOne({ where: { level: 1, TicketID: id } });

    const TicketMasterUser = await User.findOne({ where: { id: TicketMaster.AdminID } });


    // sending link to ticket master email
    var name = req.user.dataValues.name;

    let url = `${process.env.BASE_URL}:${process.env.PORT}/ticket/giveAccess/${userId}/${id}`;

    sendRequest(TicketMasterUser.email, url, userId, id, name)
        .then(response => {
            console.log(response);
            flashMessage(res, 'success', "Please wait for the ticket master of ticket : " + id + " to grant you access");
            res.redirect('/user/login');
        })
        .catch(err => {
            console.log(err);
            flashMessage(res, 'error', 'Error when sending email to ' + TicketMasterUser.email);
            res.redirect('/');
        });
});

router.get("/giveAccess/:id/:TicketId", async (req, res) => {
    const userId = req.params.id;
    const TicketId = req.params.TicketId;


    const user = await User.findByPk(userId);

    if (user) {
        let permission = Permissions.create({ TicketID: TicketId, AdminID: userId, level: 2, AdminName: user.name });
        flashMessage(res, "success", `User ${user.name} has been granted access to ticket of ID ${TicketId}`);
        res.redirect("/")
    }
    else {
        flashMessage(res, "error", "User not found");
        res.redirect("/")
    }
});

router.post("/completeTicket", async (req, res) => {
    try {
        let { reason } = req.body;
        var TicketId = req.headers.referer.split('/')[5];
        if (reason) {
            Ticket.findOne({ where: { ticketId: TicketId } })
                .then(async (ticket) => {
                    ticket.status = true;
                    ticket.completedReason = reason;
                    await ticket.save();
                    flashMessage(res, "success", "Ticket has been closed due to reason : " + reason);
                    res.redirect("../admin/AdminPage");
                })

        }
        else {
            flashMessage(res, "error", "something went wrong");
            res.redirect("back");
        }
    }
    catch (err) {
        console.log(err);
    }

});


router.get("/downloadPictures/:id", async (req, res , cb) => {
    const id = req.params.id;
    const Images = await TicketImages.findAll({ where: { ResponseId: id } });

    const ImageInfoArray = [];


    for (let i = 0; i < Images.length; i++) {
        console.log(Images[i].base64)
        ImageInfoArray.push({ url: `https://storage.googleapis.com/handyhandphone/${Images[i].base64}`, file: `download${i}.png` })
    }
    console.log(ImageInfoArray)

    var zip = new JSZip();

    const request = async () => {
        for (const { file, url } of ImageInfoArray) {
        const response = await fetch(url);
        const buffer = await response.buffer();
        zip.file(file, buffer);
      }
    }
    request()
    .then(() => {
        // Set the name of the zip file in the download
        res.setHeader('Content-Disposition', 'attachment; filename="pictures.zip"')
    
        // Send the zip file
        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
          .pipe(res).on('finish', function() {
              console.log("out.zip written.");
          })
      })
});


router.get('/deleteTicket/:TicketId', async(req, res, next)=>{
    const TicketId =  req.params.TicketId;

    const ticket = await Ticket.findByPk(TicketId);

    
         
    if(ticket){
        mySQLDB.query(`DELETE t , p , r FROM ticketimages t 
        INNER JOIN permissions p on p.TicketID = t.ticketId 
        INNER JOIN responses r on r.ticketId = t.ticketId 
        WHERE t.ticketId = ${TicketId} AND r.ticketId = ${TicketId} AND p.TicketID = ${TicketId};`)
        await ticket.destroy();
        res.redirect("back");
    }
    else
    {
        flashMessage(res , "error", "Could not find the ticket");
        res.redirect("back");
    }
});
module.exports = router;