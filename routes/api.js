/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

const { expect } = require("chai");
const { ObjectID } = require("mongodb");

module.exports = (app, db) => {
  app
    .route("/api/issues/:project")

    .get((req, res) => {
      const { project } = req.params;
      const myQuery = req.query;
      const collection = db.collection(project);

      if (myQuery._id) myQuery._id = ObjectID(myQuery._id);
      if (myQuery.open) myQuery.open = myQuery.open === "true";

      collection
        .find(myQuery)
        .toArray()
        .then(items => {
          return res.send(items);
        })
        .catch(err => console.error(`Failed to find documents: ${err}`));
    })

    .post((req, res) => {
      const { project } = req.params;
      const newIssue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        open: true,
        status_text: req.body.status_text || ""
      };

      if (!newIssue.issue_title || !newIssue.issue_text || !newIssue.created_by)
        return res.send("missing inputs");

      const collection = db.collection(project);

      return collection
        .insertOne(newIssue)
        .then(response => {
          res.json(response.ops[0]);
        })
        .catch(err => console.error(`Failed to insert item: ${err}`));
    })

    .put((req, res) => {
      const { project } = req.params;

      const collection = db.collection(project);

      const updatedFields = {};

      Object.keys(req.body).forEach(key => {
        if (req.body[key] && key !== "_id") {
          updatedFields[key] = req.body[key];
        }
      });
      if (Object.keys(updatedFields).length === 0) {
        res.send("no updated field sent");
      }
      if (updatedFields.open)
        updatedFields.open = updatedFields.open === "true";
      updatedFields.updated_on = new Date();

      collection
        .findOneAndUpdate(
          { _id: ObjectID(req.body._id) },
          {
            $set: updatedFields
          },
          { returnOriginal: false }
        )
        .then(() => {
          return res.send("successfully updated");
        })
        .catch(err =>
          console.error(`Failed to find and update document: ${err}`)
        );
    })

    .delete((req, res) => {
      const { project } = req.params;

      const collection = db.collection(project);

      if (!req.body._id) return res.send("_id error");

      collection
        .deleteOne({ _id: ObjectID(req.body._id) })
        .then(() => {
          return res.send(`deleted ${req.body._id}`);
        })
        .catch(err => console.error(`Failed to deleted document: ${err}`));
    });
};
