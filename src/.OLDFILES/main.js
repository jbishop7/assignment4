const { response } = require('express');
const express = require ('express');
const conn = require('./DBConn.js');
const app = express();
var path = require('path');
const session = require('express-session');

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
}));


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
    res.render('m-login');
});

//handle when they submit the login form
app.post('/login', (req, res)=>{
    //get email and password from user
    conn().connect();
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
        conn().query(sql, (err, results)=> {
            if(err) throw err;

            if(results.length > 0){
                req.session.member = results[0];    //this stores ALL user data as a JSON object.
                console.log(req.session.member);
                console.log(req.session.member.ID);
                res.render('member-portal');
            }else{
                res.render('m-login', { error: "Incorrect credentials."})
            }
        })
    }else{
        let errorMsg = errors.join('. ');
        res.render('m-login', { error: errorMsg})
    }
    conn().end();
});

//register for new members- redirected from index
app.get('/register', (req, res)=>{
    //console.log(req.body); returns nothing bc its a get
    res.render('register');
});

//handle when they submit their registration.
app.post('/register', (req, res)=>{
    // fetch all the data in variable
    conn().connect();
    
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let name = `${firstName} ${lastName}`;
    let age = req.body.age;
    age = parseInt(age);
    let tier = req.body.tier;
    tier = parseInt(tier);
    let gender = req.body.gender;
    let phone = req.body.phNum;
    let email = req.body.email;
    let addy = req.body.addr;

    let efirstName = req.body.first_name;
    let elastName = req.body.last_name;
    let ename = `${efirstName} ${elastName}`;
    let eaddy = req.body.eaddr;
    let ephone = req.body.ephNum;
    let erel = req.body.relationToMem;


    let sql1 = `INSERT INTO Member VALUES(NULL, '${name}', '${addy}', '${phone}', '${email}', ${age}, '${gender}', ${tier}, 0);`
    let sql2 = `SELECT MAX(ID) As NewMember FROM Member;` ;  //store this in a variable.
    

    conn().query(sql1, (e,d, f)=>{
        if (e){throw e;}else{
            console.log('Inserted new member into member table.');

            conn().query(sql2, (e,d,f)=>{
                if (e){throw e;}else{
                    let m = d[0].NewMember;
                    let sql3 = `INSERT INTO EmergencyContact values('${ename}', '${eaddy}', '${ephone}', '${erel}', ${m});`;
                    conn().query(sql3, (e,d,f)=>{
                        if (e){throw e;}else{
                            console.log('Emergency contact was updated.');
                            res.redirect('/login');
                        }
                    });
                }
            });
        }
    });

    conn().end();
});

app.get('/member.delete', (req, res)=>{
    //ask if they ACTUAALLY want to delete? something like that. Might need another route, or we can just get no confirmation. I don't care.
    
    let results;

    //sql statemtn get facname, cost from facility
    results = resultsFromSQL

    res.render('member-delete', {result:results});
});

// redirected from MemberAccountInfo
app.get('/check-savings',(req,res)=>{
    //grab amount owed from sql 
    //USE STATEMENT FROM FARIS THING THEN ADD THE COST OF MEMBERSHIP.
    let memberid = req.session.member.ID;

    conn().connect();
    let sql1 = `SELECT m.ID, m.MemberName, m.MembershipTier, sum(f.Cost) as AmountOwed FROM member m JOIN reservation 
    r ON m.ID = r.BookedBy JOIN facility f ON f.FacName = r.FacName WHERE m.ID = ${memberid};`;
    
    let owedFromRes;
    let membershipFlat=[];
    let disc=[];
    let total=[];
    conn().query(sql1, (e,d,f)=>{   //gets id, tier, amount we owe from reservations based on facility table.
        if (e){
            throw e;
        }
        owedFromRes = d[0].AmountOwed;
        
        conn().query(`SELECT Cost, discount from Membership`, (e,data,f)=>{
            
            for (let a = 0; a <=2; a++){
            membershipFlat[a] = data[a].Cost;
            disc[a] = data[a].discount;
            total[a] = (disc[a]*owedFromRes)+membershipFlat[a];
            }
            

            res.render('member-savings', {total1: total[0], total2:total[1], total3:total[2]});
            
        });
    });

    
    
    conn().end();
});

// redirected from MemberAccountInfo
app.get('/view-billing',(req,res)=>{
    //grab amount owed from sql 
    //USE STATEMENT FROM FARIS THING THEN ADD THE COST OF MEMBERSHIP.
    let memberid = req.session.member.ID;

    conn().connect();
    let sql1 = `SELECT m.ID, m.MemberName, m.MembershipTier, sum(f.Cost) as AmountOwed FROM member m JOIN reservation 
    r ON m.ID = r.BookedBy JOIN facility f ON f.FacName = r.FacName WHERE m.ID = ${memberid};`;
    
    let owedFromRes;
    let membershipFlat;
    let disc;
    let total;
    conn().query(sql1, (e,d,f)=>{
        if (e){
            throw e;
        }
        owedFromRes = d[0].AmountOwed;
        let t = d[0].MembershipTier;

        conn().query(`SELECT Cost, discount from Membership Where tier = ${t}`, (e,data,f)=>{
            
            membershipFlat = data[0].Cost;
            disc = data[0].discount;
            total = (disc*owedFromRes)+membershipFlat;
            res.render('member-view-billing', {total: total});
            
        });
    });

    
    
    conn().end();
});

// redirected from MemberAccountInfo
app.get('/change-membership',(req, res)=>{
    //AYO we need another route i think for the post from this
    res.render('member-change-tier');
});

app.post('change-membership', (req, res)=>{
    //handle the change. SQL 
});

app.post('/change-tier-confirm',(req, res)=>{
    //do some magic, update SQL 
    res.render('member-portal');
})

// redirected from MemberAccountInfo
app.get('/add-emergency-contact', (req,res)=>{
    res.render('member-add-ec');
});

app.post('/add-emergency-contact', (req,res)=>{
    //ok so that worked and is all good and cool.
    //we can do some data and then send us back to the member portal?
    console.log(req.body);
    res.send('this is from a post wow it worked');
});

app.get('/weekly-recap', (req, res)=>{

});

// redirected from MemberAccountInfo
app.get('/delete-emergency-contact', (req,res)=>{
    res.render('member-del-ec');
});

app.post('/delete-emergency-contact', (req,res)=>{
    //delete the SHIT from SQL
});

// redirected from Member Home Portal
app.get('/create-reservation', (req,res)=>{
    conn().connect();
    let sql = "SELECT FacName FROM facility";
    conn().query(sql, (err,FacNames)=>{
        res.render('create-res',{FacNames: FacNames});
    })
    conn().end();
});


// Handle when create reservation form is submitted
app.post('/create-reservation', (req, res) => {
    conn().connect();
    //fetch variables from req
    let startTime = req.body.startdt;
    let bookedBy = req.session.member.ID;  // 8 is just temporary for now will remove soon
    let facName = req.body.facName;
    let endTime = req.body.enddt;
    //push variables to db
    
    let sql = "INSERT INTO reservation VALUES ('"+startTime+"', '"+bookedBy+"', '"+facName+"', '"+endTime+"');";
    conn().query(sql, (err)=>{
        if(err) throw err;
        res.render('view-res');
    });
    /*SELECT amount_owed from Member where id = 2005;
    Select membershiptier from Member WHERE id = 2005;
    SELECT discount from MemberShip where tier = (Select membershiptier from Member WHERE id = 2005);
    SELECT Cost FROM Facility WHERE FacName = 'Faris Football Fields'; 
    new amount = cost*discount + previous amount
    let sql2 = `UPDATE Member SET amount_owed = ${newAmount} WHERE id = ${bookedBy}; `;
    
*/
    conn().end();
    updateAmountOwed(bookedBy, facName);
});

function updateAmountOwed(b, f){
    conn().connect();
    let sql1 = `SELECT amount_owed from Member where id = ${b};`;   //need to store this somewhere
    let pCost;  //store value from sql1
    let sql2 = `SELECT discount from MemberShip where tier = (Select membershiptier from Member WHERE id = ${b});`;
    let disc;   //store discount
    let sql3 = `SELECT Cost FROM Facility WHERE FacName = '${f}';`;
    let fCost;  //store facility cost
    let newCost = pCost;    //just incase something goes wrong?
    let sql4 = `UPDATE Member SET amount_owed = `
    conn().query(sql1, (err, data, fields )=>{
        if (err){
            throw err;
        }
        pCost = data[0].amount_owed;
       // console.log(pCost);

        conn().query(sql2, (e, d,f)=>{
            if (err){
                throw err;
            }
            disc = d[0].discount;
            //console.log(disc);
            conn().query(sql3, (e,d,f)=>{
                if (err){
                    throw err;
                }
                fCost = d[0].Cost;
               // console.log(fCost);
                newCost = (disc*fCost) + pCost;
                let sql4 = `UPDATE Member SET amount_owed = ${newCost} WHERE id = ${b};`;
                conn().query(sql4, (e, d, f)=>{
                    if (!e){
                        console.log(`updated amount owed for ${b} from ${pCost} to ${newCost}`);
                    }else{
                        throw e;
                    }
                });
            });
        });
    });


    conn().end();
};


// redirected from Member Home Portal
app.get('/view-reservation', (req,res)=>{
    conn().connect();
    let bookedBy = req.session.member.ID // 8 is just temporary for now will remove soon
    console.log(bookedBy);
    let sql =`SELECT * FROM reservation WHERE BookedBy= ${bookedBy}`;
    conn().query(sql, (err, reservations)=>{
        if (err) throw err;
        res.render('view-res', {reservations: reservations});
    });
    conn().end();
});

// redirected from Member Home Portal
app.get('/cancel-reservation', (req,res)=>{
    conn().connect();
    let bookedBy = req.session.member.ID; // 8 is just temporary for now will remove soon
    let sql ="SELECT * FROM reservation WHERE BookedBy= '"+bookedBy+"' AND StartTime > now()";
    conn().query(sql, (err, reservations)=>{
        if (err) throw err;
        //console.log(reservations);
        res.render('cancel-res', {reservations: reservations});
    });
    conn().end();
});

app.post('/cancel-reservation',(req,res)=>{
    conn().connect();
    let r = req.body.facName;
    r = r.split('#');
    t = getResDetails(r);
    
    let facename = t[0];
    let startTime = t[1];
    let sql= `DELETE FROM reservation WHERE FacName= '${facename}' AND StartTime = '${startTime}' AND BookedBy = ${req.session.member.ID};`;
    conn().query(sql, (e,d,f)=>{
        if (e){throw e;}else{
        {console.log("a reservation was deleted");}
        res.redirect('/view-reservation');
        }
    });
    
    conn().end();

});
function getResDetails(r){
    let fName = r[0];
    let dt = r[1].split(' ');
    let m = dt[1];
    let d = dt[2];
    let y = dt[3];
    let time = dt[4];
    let mNum;
    
    switch(m){
        case 'Jan':
            mNum = 1;
            break;
        case 'Feb':
            mNum = 2;
            break;
        case 'Mar':
            mNum = 3;
            break;
        case 'Apr':
            mNum = 4;
            break;
        case 'May':
            mNum = 5;
            break;
        case 'Jun':
            mNum = 6;
            break;
        case 'Jul':
            mNum = 7;
            break;
        case 'Aug':
            mNum = 8;
            break;
        case 'Sept':
            mNum = 9;
            break;
        case 'Oct':
            mNum = 10;
            break;
        case 'Nov':
            mNum = 11;
            break;
        case 'Dec':
            mNum = 12;
            break;

    }
    let finalDT = `${y}-${mNum}-${d} ${time}`;

    return [fName, finalDT];
}

// redirected from Member Home Portal
app.get('/add-friend', (req,res)=>{

    res.render('addfriend');
});

app.post('/friend-added', (req, res)=>{
    conn().connect();
    let friendName = req.body.friend;
    console.log(friendName);
    let sql = "SELECT ID FROM member WHERE MemberName = '"+friendName+"'";
    conn().query(sql, (err, member) => {
        if(member.length > 0){
            let member1 = req.session.member.ID;//8 is just temporary for now will remove
            let member2 = member[0].ID;

            let sql2 = "INSERT INTO memberfriendlist VALUES ('"+member1+"','"+member2+"')";
            conn().query(sql2, err => {
                if(err) throw err;
                res.redirect('/view-friends');
            })

        }else{
            res.send("No user found.")
        }
        conn().end();
    });
});

// redirected from Member Home Portal
app.get('/view-friends', (req,res)=>{
    conn().connect();
    let userId = req.session.member.ID;// 8 is just temporary for now will remove soon
    let sql = `SELECT * FROM memberfriendlist mf JOIN member m ON mf.Member2 = m.ID WHERE Member1 = ${userId};`;
    let sql3 = `SELECT * FROM memberfriendlist mf JOIN member m ON mf.Member1 = m.ID WHERE Member2 = ${userId};`;
    conn().query(sql, (err, friends) => {
        if(err) throw err;
        let sql2 = "SELECT m.MemberName, mf.Member2, date(r.StartTime) as ReservationDate FROM memberfriendlist mf JOIN reservation r ON mf.Member2 = r.BookedBy JOIN member m ON m.ID = mf.Member2 WHERE Member1 = '"+userId+"' AND date(r.StartTime) IN (SELECT date(StartTime) FROM reservation WHERE BookedBy = '"+userId+"')"
        conn().query(sql2, (err, mutualReservations) => {
            console.log(mutualReservations)
            res.render('viewfriends', {friends: friends, mutualReservations: mutualReservations})
        });
    });
    conn().end();
});

// redirected from the Member Home Portal
app.get('/member-account-info', (req,res)=>{
    res.render('member-acc-info');
});

app.get('/portal', (req, res)=>{
    res.render('member-portal');
})


/////////////////////////////////////////////////////////////
//Logout can be used by all users. We will just clean up the session
//and redirect to index page.
app.get('/logout', (req,res)=>{ // bring it back to the sign in page and erase user session json file
    //erase user session. -> session gets overwritten during login stages. That should be fine for the scope of this project.
    res.redirect('/');
});
///////////////////////////////////////////////////////////////



//STAFF ONLY METHODS

//login page for staff. Redirected from index
app.get('/login-staff', (req, res)=>{
    res.render('s-login');
});

app.post('/login-staff', (req, res)=>{
    //IF REQ.BODY CONTAINS AN M, RES.RENDER(MANAGER-PORTAL)
    //OTHERWISE GO TO STAFF PORTAL


    //get eID and password from user
    conn().connect();
    let eID = req.body.id;
    let password = req.body.password;
    let errors = [];
    console.log(eID);
    //validate the input
    if(eID == null || eID == ''){
        errors.push("Empty eID")
    }
    if(password == null || password == ''){
        errors.push("Empty password")
    }
    let staffType;
    if (eID.includes('M')){
        staffType = 'manager';
        eID = eID.replace('M','');
        console.log(eID);
    }else{
        staffType = 'staff';
        eID = eID.replace('S','');
        console.log(eID);
    }
    


    //check db for eID
    if (errors.length == 0) {
        //check in db
        let sql = `SELECT * From ${staffType} WHERE employeeid = ${eID}`;
        conn().query(sql, (err, results)=> {
            if(err) throw err;

            if(results.length > 0){
                req.session.member = results[0];    //this stores ALL user data as a JSON object.
                console.log(req.session.member);
                if(staffType = 'manager'){
                    res.render('manager-portal');
                }else{
                    res.render('s-portal');
                }
                
            }else{
                res.render('login-staff', { error: "Incorrect credentials."})
            }
        })
    }else{
        let errorMsg = errors.join('. ');
        res.render('login-staff', { error: errorMsg})
    }
    conn().end();


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
    res.render('manager-add-emp');
});

// redirected from manager portal 
app.post('/add-employee', (req, res)=>{
    conn().connect();
    let sql1 = `INSERT INTO Staff VALUES ('${req.body.name}','${req.body.addy}', '${req.body.phone}',
    NULL, ${req.body.age}, '${req.body.gender}', ${req.body.salary}, ${req.session.member.EmployeeID});`;

    conn().query(sql1, (e,d,f)=>{
        if (e){throw e;}else{console.log('employee added successfully');}
        res.render('manager-portal');
    });

    conn().end();
    
});

// redirected from manager portal 
app.get('/remove-employee', (req, res)=>{
    //see all the employees we can delete
    conn().connect();
    let mID = req.session.member.EmployeeID;
    let sql1 = `SELECT StaffName, EmployeeID from Staff Where ManagerID = ${mID};`;
    conn().query(sql1, (e,emps,f)=>{
        if (e){throw e;}
        res.render('manager-del-emp', {empData:emps});
    });
    conn().end();
    
});

app.post('/remove-employee', (req, res)=>{
    conn().connect();
    let empToBeFired = req.body.employees;

    conn().query(`DELETE From EmployeeSchedule WHERE EmployeeID = ${empToBeFired};`, (e,d,f)=>{
        if (e){
            throw e;
        }else{
            conn().query(`DELETE FROM Staff WHERE employeeid = ${empToBeFired};`, (e,d,f)=>{
                if (e){throw e;}
                else{
                console.log(`${empToBeFired} was fired. Good Riddance`);
                res.render('manager-portal');
                }
           
            });
        }
    });

    

    conn().end();
    
});

// redirected from manager portal 
app.get('/view-employee', (req, res)=>{
    conn().connect();
    let mID = req.session.member.EmployeeID;
    conn().query(`SELECT * FROM Staff WHERE ManagerID = ${mID};`, (e,employee,f)=>{
        if (e){throw e;}
        else{
            res.render('manager-view-emps', {employee:employee});
        }
    });
    

    conn().end();
});

// redirected from manager portal 
app.get('/assign-employees-shifts', (req, res)=>{
    conn().connect();
    let sql1 = `SELECT StaffName, EmployeeID FROM Staff WHERE ManagerID = ${req.session.member.EmployeeID};`;
    let sql2 = `SELECT FacName FROM Facility;`;

    conn().query(sql1, (e,StaffDetails, f)=>{
        if (e){throw e;}else{
            let s = StaffDetails;
            conn().query(sql2, (e, Fac, f)=>{
                if (e){throw e;}else{
                    res.render('manager-assign-emps', {staff:StaffDetails, fac:Fac});
                }
            });
        }
    });

    conn().end();
    
});

app.post('/assign-employees-shifts', (req, res)=>{
    conn().connect();
    let id = parseInt(req.body.empNames);
    let st = req.body.startdt.replace('T',' ');
    let et = req.body.enddt.replace('T',' ');
    let f = req.body.facNames;
    conn().query(`INSERT Into EmployeeSchedule VALUES(${id}, '${f}', '${st}', '${et}');`, (e,d,f)=>{
        if (!e){console.log('successfully signed up for a shift');}
        res.redirect('manager');
    });
    
    conn().end();
    
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
        res.render('/login');
    }
}



app.listen(80);