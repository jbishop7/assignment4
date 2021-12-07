const { response } = require('express');
const express = require ('express');
const connect = require('./DBConn.js');
const session = require('express-session');
let conn = connect();
const app = express();
var path = require('path');

app.use(express.static('views'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
    express.urlencoded({
      extended: true
    })
  )

app.use(session({
    secret: "random-value-123",
    resave: false,
    saveUninitialized: false
}))

//app.use(require('body-parser').urlencoded({extended: false}));
app.use(express.json());

//index / homepage 
app.get('/', (req, res) => {
    //this is our index page....
    res.render('index');
});


/*
*********************
    Member Routes
*********************
*/

//login for members - redirected from index
app.get('/login', (req, res) => {
    res.render('m-login')
});

//handle when they submit the login form
app.post('/login', (req, res)=>{
    //get email and password from user
    let email = req.body.email;
    let password = req.body.password;
    let errors = [];

    //validate the input
    if(email == null || email == ''){
        errors.push("Empty email")
    }
    if(password == null || password == ''){
        errors.push("Empty password")
    }

    //check db for email
    if (errors.length == 0) {
        //check in db
        let sql = "SELECT * FROM member WHERE Email = '"+email+"'";
        conn.query(sql, (err, results)=> {
            if(err) throw err;

            if(results.length > 0){
                req.session.member = results[0];
                res.redirect('member-portal');
            }else{
                res.render('m-login', { error: "Incorrect credentials."})
            }
        })
    }else{
        let errorMsg = errors.join('. ');
        res.render('m-login', { error: errorMsg})
    }
});

//register for new members- redirected from index
app.get('/register', (req, res)=>{
    //console.log(req.body); returns nothing bc its a get
    res.render('register');
});

//handle when they submit their registration.
app.post('/register', (req, res)=>{
    // fetch all the data in variable
    let firstName = req.body.first_name;

    //create let sql1 = "INSERT INTO member ..."
    //INSERT INTO `reccentre2`.`member` (`ID`, `MemberName`, `Address`, `Phone`, `Email`, `Age`, `Gender`, `MembershipTier`) VALUES ('6588', 'name', 'address', '0000', 'a@b.c', '8', 'M', '1');

    //INSERT into emergency contact


});

//redirected from login. Brings us to home of member page
app.get('/member-portal', (req, res)=>{
    res.end(res.render('member-portal'));
    //res.render('member-portal');
});


app.get('/member.delete', (req, res)=>{
    //ask if they ACTUAALLY want to delete? something like that. Might need another route, or we can just get no confirmation. I don't care.
    
    let results;

    //sql statemtn get facname, cost from facility
    results = resultsFromSQL

    res.render('member-delete', {result:results});
});


app.post('/register-success', (req, res)=>{
    //need to handle registration details. Then need to redirect them to a new page
    console.log(req.body);
    res.end(res.render('member-portal'));
    
});

// redirected from MemberAccountInfo
app.get('/check-savings',(req,res)=>{

});

// redirected from MemberAccountInfo
app.get('/view-billing', (req,res)=>{
    //grab amount owed from sql
    res.render('member-view-billing');
});

// redirected from MemberAccountInfo
app.get('/change-membership',(req, res)=>{
    //AYO we need another route i think for the post from this
    res.render('member-change-tier');
});

app.post('/change-tier-confirm',(req, res)=>{
    //do some magic, update SQL 
    res.render('member-portal');
})

// redirected from MemberAccountInfo
app.post('/add-emergency-contact', (req,res)=>{

});

// redirected from MemberAccountInfo
app.get('/delete-emergency-contact', (req,res)=>{

});

// redirected from Member Home Portal
app.get('/create-reservation', (req,res)=>{
    let sql = "SELECT FacName FROM facility";
    conn.query(sql, (err,FacNames)=>{
        res.render('create-res',{FacNames: FacNames});
    })
    
});
app.post('/create-reservation', (req, res) => {
    //fetch variables from req
    let startTime = req.body.startdt;
    let bookedBy = req.session.member?.ID ?? 8; // 8 is just temporary for now will remove soon
    let facName = req.body.facName;
    let endTime = req.body.enddt;
    //push variables to db
    let sql = "INSERT INTO reservation VALUES ('"+startTime+"', '"+bookedBy+"', '"+facName+"', '"+endTime+"');";
    conn.query(sql, (err)=>{
        if(err) throw err;
        res.redirect('view-reservation');
    });
});

// redirected from Member Home Portal
app.get('/view-reservation', (req,res)=>{
    let bookedBy = req.session.member?.ID ?? 8; // 8 is just temporary for now will remove soon
    let sql ="SELECT * FROM reservation WHERE BookedBy= '"+bookedBy+"' ";
    conn.query(sql, (err, reservations)=>{
        if (err) throw err;
        res.render('view-res', {reservations: reservations});
    });
});

// redirected from Member Home Portal
app.get('/cancel-reservation', (req,res)=>{
    let bookedBy = req.session.member?.ID ??8; // 8 is just temporary for now will remove soon
    let sql ="SELECT * FROM reservation WHERE BookedBy= '"+bookedBy+"' AND StartTime > now()";
    conn.query(sql, (err, reservations)=>{
        if (err) throw err;
        console.log(reservations)
        res.render('cancel-res', {reservations: reservations});
    })
});

app.post('/cancel-reservation',(req,res)=>{
    let facename = req.body.facName;
    let sql= "DELETE FROM reservation WHERE FacName= '"+facename+"'";
    conn.query(sql, (err)=>{
        if(err) throw err;
        res.redirect('view-reservation')
    });
});

// redirected from Member Home Portal
app.get('/add-friend', (req,res)=>{

    res.render('addfriend');
});

app.post('/friend-added', (req, res)=>{
    let friendName = req.body.name;
    let sql = "SELECT ID FROM member WHERE MemberName = '"+friendName+"'";
    conn.query(sql, (err, member) => {
        if(member.length > 0){
            let member1 = req.session.member?.ID ?? 8;//8 is just temporary for now will remove
            let member2 = member[0].ID;

            let sql2 = "INSERT INTO memberfriendlist VALUES ('"+member1+"','"+member2+"')";
            conn.query(sql2, err => {
                if(err) throw err;
                res.redirect('view-friends');
            })

        }else{
            res.send("No user found.")
        }
    })
});

// redirected from Member Home Portal
app.get('/view-friends', (req,res)=>{
    let userId = req.session.member?.ID ?? 8;// 8 is just temporary for now will remove soon
    let sql = "SELECT * FROM memberfriendlist mf JOIN member m ON mf.Member2 = m.ID WHERE Member1 = "+userId;
    conn.query(sql, (err, friends) => {
        if(err) throw err;
        let sql2 = "SELECT m.MemberName, mf.Member2, date(r.StartTime) as ReservationDate FROM memberfriendlist mf JOIN reservation r ON mf.Member2 = r.BookedBy JOIN member m ON m.ID = mf.Member2 WHERE Member1 = '"+userId+"' AND date(r.StartTime) IN (SELECT date(StartTime) FROM reservation WHERE BookedBy = '"+userId+"')"
        conn.query(sql2, (err, mutualReservations) => {
            console.log(mutualReservations)
            res.render('viewfriends', {friends: friends, mutualReservations: mutualReservations})
        })
    })
});

// redirected from the Member Home Portal
app.get('/member-account-info', (req,res)=>{
    res.render('member-acc-info');
});


/////////////////////////////////////////////////////////////
//Logout can be used by all users. We will just clean up the session
//and redirect to index page.
app.get('/logout', (req,res)=>{ // bring it back to the sign in page and erase user session json file
    //erase user session.
    res.render('index');
});
///////////////////////////////////////////////////////////////



//STAFF ONLY METHODS

//login page for staff. Redirected from index
app.get('/login-staff', (req, res)=>{
    res.render('s-login');
});


//redirected from staff login. brings us to staff page.
app.get('/staff', (req, res)=>{
    res.render('s-portal'); 
});

// redirected from staff portal
app.get('/view-shift', (req, res)=>{
    //do SQL magic to grab all shifts for that staff member
    res.render('s-view-shift');
});

// redirected from staff portal
app.get('/view-payment-details', (req, res)=>{
    //do SQL magic once again, grab salary and shit
    res.render('s-payment');
});


//MANAGERS
//redirects to manager portal from LOGIN-STAFF
app.get('/manager', (req, res)=>{
    res.render('manager-portal');
});

// redirected from manager portal 
app.get('/add-employee', (req, res)=>{
    res.render('add-emp');
});

// redirected from manager portal 
app.get('/remove-employee', (req, res)=>{
    res.render('rem-emp-confirm');
});

// redirected from manager portal 
app.get('/view-employees', (req, res)=>{
        //need to send it an object w data from SQL
    res.render('manager-view-emps');
});

// redirected from manager portal 
app.get('/assign-employees-shifts', (req, res)=>{

    res.render('manager-assign');
});

// redirected from manager portal
app.get('/payment-details', (req,res)=>{
    res.render('manager-pd');
});


/*
**********************
    Global Functions
**********************
*/
function checkMemberSignedIn(req, res, next){
    if(req.session.member){
        next()
    }else{
        res.redirect('login');
    }
}

app.listen(80);