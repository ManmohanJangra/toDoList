const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/modules/date.js');
const mongoose = require("mongoose");
const _ = require('lodash');

// const port = 3000;

const app = express();

const savedItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect("mongodb+srv://admin:admin123@cluster0.7qtc35k.mongodb.net/todoListDB");

const itemsSchema = new mongoose.Schema({
    item: {
            type: String,
            required: [true, "Please Check Your Data Entry, No Name Specified"]
        }
});

const itemModal = mongoose.model("Item", itemsSchema);

const item1 = new itemModal({
    item: "Orange"
});

const item2 = new itemModal({
    item: "Mango"
});

const item3 = new itemModal({
    item: "Papaya"
});

const saveItem = [];

const listSchema = {
    name: String,
    items: [itemsSchema],
}
const List = mongoose.model("List", listSchema);

// itemModal.insertMany(saveItem, function (err) {
//     if(err){
//         console.log(err);
//     } else{
//         console.log("Item Inserteed");
//     }
// });

app.get('/', (req, res) => {

    let day = date.getDate();

    itemModal.find({}, (err, savedItems) => {
        // console.log(saveItem);

        res.render('list', {
            listTitle: "Today",
            newListItem: savedItems
        });

        // if(savedItems.length === 0){
        //     itemModal.insertMany(saveItem, function (err) {
        //         if(err){
        //             console.log(err);
        //         } else{
        //             console.log("Item Inserteed");
        //         }
        //     });

        //     res.redirect("/");
        // } else{
        //     res.render('list', {
        //         listTitle: day,
        //         newListItem: savedItems
        //     });
        // }
    });
});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    

    List.findOne({
                name: customListName
            }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const routelist = new List({
                    name: customListName,
                    items: saveItem,
                });

                routelist.save();

                 res.redirect('/' + customListName);
            } else {

                res.render("list", {
                    listTitle: foundList.name, newListItem: foundList.items
                });
            };
        }
    });
});


    app.post('/', (req, res) => {

        const itemName = req.body.NewThing;
        const itemList = req.body.list;

        const newItem = new itemModal({
            item: itemName
        });

        if (itemList === "Today") {
            newItem.save();
            res.redirect("/");
        } else{
            List.findOne({name: itemList}, (err, foundList) => {
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/" + itemList);
            });
        };
    });

    app.post('/delete', (req, res) => {

        const delItem = req.body.checkbox;
        const listName = req.body.listName;

        if (listName === "Today") {
            itemModal.findByIdAndRemove(delItem, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Item Deleted");
                    res.redirect("/");
                }
            });
        } else {

            List.findOneAndUpdate({
                        name: listName
                    }, {
                        $pull: {
                            items: {
                                _id: delItem
                            }
                        }
                    }, (err, foundList) => {
                        if(!err){
                            res.redirect("/"+ listName);
                            console.log("Deleted");
                        };
            });
        };
    })


    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 3000;
    }

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});