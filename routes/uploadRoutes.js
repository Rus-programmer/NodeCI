const {accessKeyId, secretAccessKey} = require("../config/dev");
module.exports = app => {
    app.get('/api/upload', requireLogin, async (req, res) => {
        console.log('cookieeeee', JSON.stringify(req.session))
        const blog = await Blog.findOne({
            _user: req.user.id,
            _id: req.params.id
        });

        res.send(blog);
    });
};

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    region: 'ap-south-1',
});