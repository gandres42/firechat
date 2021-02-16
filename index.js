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


function addInfo(username)
{
    if (username != "" && currentuser.emailVerified == true)
    {
        if (username.search('\\.') !== -1 || username.search('\\#') !== -1 || username.search('\\$') !== -1 || username.search('\\[') !== -1 || username.search('\\]') !== -1)
        {
            document.getElementById('createback').innerHTML = "username cannot contain . , # , $ , [ , or ]";
        }
        else
        {
            database().ref('users/' + currentuser.uid).update(
                {
                    uname: username,
                    verified: true,
                });
            document.getElementById('accountdetails').style.display = 'none';
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
    console.log(currentuser.providerData)
    console.log();
    var button = document.getElementById("emailverify")
    button.disabled = true;
    if(!currentuser.emailVerified)
    {
        auth.currentUser.sendEmailVerification();
    }
    button.innerHTML = "Waiting for verification..."
    button.disabled = true;
    ver = setInterval(checkverification, 10);
}

function addchat(message)
{
    if (message != '')
    {
        document.getElementById('input').value = '';
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
}

function addchat2(uname, messageId, chat)
{
    if (messageId != NaN)
    {
        var message = messageId + uname
        database().ref('chat/' + message).update({
            [uname]: chat
        });
        if (messageId == 1100)
        {
            clearchat();
        }
        messageId+=1;
        database().ref().update({
            messageId: messageId
        });
    }
}

function checkVerified()
{
        database().ref('users/' + currentuser.uid + '/verified').once('value').then(function (snapshot) {
        checkVerified2(snapshot.val());
    });
}

function checkVerified2(verified)
{
    if (!verified)
    {
        document.getElementById('stage2').style.display = 'inline';
        document.getElementById('accountdetails').style.display = 'inline';
    }
}

document.onload
{
    document.getElementById('stage2').style.display = 'none';
    document.getElementById('accountdetails').style.display = 'none';
}
database().ref('chat').on('value', function(snapshot) {
    var chat = Object.values(snapshot.val());
    document.getElementById('chatbox').innerHTML = '';
    chat.forEach(function(i){
       document.getElementById('chatbox').innerHTML = document.getElementById('chatbox').innerHTML + "<b>" + (sanitizeString(JSON.stringify(i)).replace(/{/g, "").replace(/}/g, "").replace(/"/g, "").replace(/:/, ": ") + "<br>").replace(": ", "</b>: ");
    });
});

function clearchat()
{
    database().ref('chat').remove();
    database().update({
        messageId: 10
    });
    addchat2('system', 10, 'message capacity reached, chat reset');
}

function handleEnter(e){
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
        addchat(document.getElementById('input').value);
    }
}

function sanitizeString(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

function settings() {
    document.getElementById("stage2").style.display = 'inline';
    document.getElementById("settingdetails").style.visibility = 'visible';

    var initSettingsData = database().ref('/users/' + currentuser.uid).once('value').then(function (snapshot) {
        document.getElementById("settingsuname").value = snapshot.val().uname;
    });
}

function updateSettings()
{
    database().ref("users/" + currentuser.uid).update({
       uname: document.getElementById("settingsuname").value
    });
    cancelSettings();
}

function cancelSettings()
{
    document.getElementById("stage2").style.display = 'none';
    document.getElementById("settingdetails").style.visibility = 'hidden';
}

function deleteAccount()
{
    database().ref("users/" + currentuser.uid).remove();

    auth.currentUser.delete().then(function() {
        console.log("user deleted");
    }).catch(function(error) {
        console.log(error);
    });
}
