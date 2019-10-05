const auth = firebase.auth();
var database = firebase.database;
var currentuser;
var ver;


function check()
{
    const email = document.getElementById("username").value
    const pass = document.getElementById("password").value
    auth.signInWithEmailAndPassword(email, pass).catch(function(error) {
        document.getElementById("passreturn").innerHTML = error.message;
    });
}


function logout()
{
    auth.signOut();
}

function redirect()
{
    window.location = "index.html";
}

auth.onAuthStateChanged(function(user)
{
    if(user) {
        const filename = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
        if (filename == "signup.html" || (filename != 'chat.html' && filename != 'signup.html')) {
            window.location = "chat.html";
        }
        currentuser = user
        checkVerified();
    }
    else
    {
        const filename = location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
        if(filename != 'index.html' && filename != 'signup.html')
        {
            window.location = "index.html";
        }
    }
});

function googledirect()
{
    auth.signInWithRedirect(provider);
}

function passmatch()
{
    if (document.getElementById("newpass").value != document.getElementById("confirmnewpass").value)
    {
        document.getElementById("newpass").style.border= '2px solid red';
        document.getElementById("confirmnewpass").style.border= '2px solid red';
        document.getElementById("feedback").style.color= "red";
        //document.getElementById("feedback").innerHTML= "the passwords do not match";
    }
    else
    {
        document.getElementById("newpass").style.border= '2px solid #e9e9e9';
        document.getElementById("confirmnewpass").style.border= '2px solid #e9e9e9';
        document.getElementById("feedback").style.color= "black";
        //document.getElementById("feedback").innerHTML= "";
    }
}
function nextLogin(email, pass, passmatch)
{
    if (pass == passmatch && pass != "")
    {
        const promise = auth.createUserWithEmailAndPassword(email, pass);
        promise
            .catch(e => document.getElementById("createback").innerHTML = e.message);
    }
    else
    {
        document.getElementById("createback").innerHTML = "passwords do not match or are invalid";
    }
}


function addInfo(fname, lname, username)
{
    if (fname != "" & lname != "" & username != "" & currentuser.emailVerified == true)
    {
        if (username.search('.') === -1 & username.search('\\#') === -1 & username.search('\\$') === -1 & username.search('\\[') === -1 & username.search('\\]') === -1)
        {
            document.getElementById('createback').innerHTML = "username cannot contain . , # , $ , [ , or ]";
        }
        else
        {
            console.log("heck yeah");
            database().ref('users/' + currentuser.uid).update(
                {
                    fname: fname,
                    lname: lname,
                    uname: username,
                    verified: true,
                });
            document.getElementById('createaccount2').style.display = 'none';
            document.getElementById('stage2').style.display = 'none';
        }
    }
    else
    {
        document.getElementById('createback').innerHTML = "all fields must be filled";
    }

}

function checkverification()
{
    var button = document.getElementById("emailverify");
    currentuser.reload();
    if (currentuser.emailVerified == true)
    {
        clearInterval(ver);
        button.innerHTML = "Email Verified!";
        button.style.background = "#00E676";
        button.style.borderColor = "#00E676";
    }
}

function emailverify()
{
    var button = document.getElementById("emailverify")
    button.disabled = true;
    if(!currentuser.emailVerified)
    {
        currentuser.sendEmailVerification();
    }
    button.innerHTML = "Waiting for verification..."
    button.disabled = true;
    ver = setInterval(checkverification, 10);
}

function addchat(message)
{
    console.log("not again");
    var username;
    var messageId;
    database().ref('users/' + currentuser.uid + '/uname').once('value').then(function (snapshot) {
        username = snapshot.val();
    });
    database().ref('messageId').once('value').then(function (snapshot) {
        messageId = snapshot.val();
        addchat2(username, messageId, message);
    });
}

function addchat2(uname, messageId, chat)
{
    var message = messageId + uname
    database().ref('chat/' + message).update({
        [uname]: chat
    });
    messageId++;
    database().ref().update({
        messageId: messageId
    });
}

function checkVerified()
{
        database().ref('users/' + currentuser.uid + '/verified').once('value').then(function (snapshot) {
        checkVerified2(snapshot.val());
        console.log(snapshot.val());
    });
}

function checkVerified2(verified)
{
    console.log('test');
    console.log(verified)
    if (!verified)
    {
        document.getElementById('stage2').style.display = 'inline';
        document.getElementById('createaccount2').style.display = 'inline';
    }
}

document.onload
{
    document.getElementById('stage2').style.display = 'none';
    document.getElementById('createaccount2').style.display = 'none';
}
database().ref('chat').on('value', function(snapshot) {
    var chat = Object.values(snapshot.val());
    console.log(chat);
    document.getElementById('chatbox').innerHTML = "";
    chat.forEach(function(i){
       document.getElementById('chatbox').innerHTML = document.getElementById('chatbox').innerHTML + JSON.stringify(i).replace(/{/g, "").replace(/}/g, "").replace(/"/g, "").replace(/:/g, ": ") + "<br>";
    });
});