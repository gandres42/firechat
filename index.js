const auth = firebase.auth();
var database = firebase.database();
var currentuser;

auth.onAuthStateChanged((user) => {
    document.getElementById('passreturn').style.visibility = 'hidden';
    if (user) {
        document.getElementById("login").style.visibility = 'hidden';
        document.getElementById("signup").style.visibility = 'hidden';
        document.getElementById("chat").style.visibility = 'visible';
        currentuser = user.uid;
        database.ref('users/' + currentuser).once('value').then(function (snapshot) {
            if (snapshot.val() == null)
            {
                database.ref('users').set({
                    [currentuser]: 'Anonymous'
                });
            }
        });
    }
    else
    {
        document.getElementById("login").style.visibility = 'visible';
        document.getElementById("chat").style.visibility = 'hidden';
        document.getElementById("signup").style.visibility = 'hidden';
        currentuser = "";
    }
});

database.ref('chat').on('value', function(snapshot) {
    if (snapshot.val() != null)
    {
        var chat = Object.values(snapshot.val());
        document.getElementById('chatbox').innerHTML = '';
        chat.forEach(function(i){
            document.getElementById('chatbox').innerHTML = document.getElementById('chatbox').innerHTML + "<b>" + (sanitize_string(JSON.stringify(i)).replace(/{/g, "").replace(/}/g, "").replace(/"/g, "").replace(/:/, ": ") + "<br>").replace(": ", "</b>: ");
        });
    }
});

function login()
{
    const email = document.getElementById("username").value
    const pass = document.getElementById("password").value
    auth.signInWithEmailAndPassword(email, pass).catch(function(error) {
        document.getElementById('passreturn').style.visibility = 'visible';
        document.getElementById("passreturn").innerHTML = error.message;
    });
}

function logout()
{
    auth.signOut();
}


function signup(email, pass, passmatch)
{
    if (pass === passmatch)
    {
        auth.createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            document.getElementById('username_select_background').style.visibility = 'visible';
            document.getElementById('username_select').style.visibility = 'visible';
        })
        .catch((error) => {
            document.getElementById("createback").innerHTML = error.message;
        });
    }
    else
    {
        document.getElementById("createback").innerHTML = "Passwords do not match";
    }
}

function send_message(message)
{
    if (message != '')
    {
        document.getElementById('input').value = '';
        var username;
        var msg_id;
        database.ref('users/' + currentuser + '/uname').once('value').then(function (snapshot) {
            username = snapshot.val();
            database.ref('msg_id').once('value').then(function (snapshot) {
                msg_id = snapshot.val();
                database.ref('users/' + currentuser).once('value').then(function (snapshot) {
                    database.ref('chat').update({
                        [msg_id]: snapshot.val() + ": " + message
                    });
                    msg_id+=1;
                    database.ref().update({
                        msg_id: msg_id
                    });
                });
            });
        });

    }
}

function handle_enter(e){
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
        send_message(document.getElementById('input').value);
    }
}

function sanitize_string(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

function delete_account(confirm)
{
    database.ref('users/' + currentuser).once('value').then(function (snapshot) {
        if (snapshot.val() == confirm)
        {
            database.ref("users/" + currentuser).remove();

            auth.currentUser.delete().then(function() {
                console.log("user deleted");
            }).catch(function(error) {
                console.log(error);
            });
        }
    });
    document.getElementById('settingsmenu').style.visibility = 'hidden';
    document.getElementById('settingsmenu_background').style.visibility = 'hidden';
}

function update_username(uname)
{
    database.ref('users').update({
        [currentuser]: uname
    });
}

function open_settings()
{
    document.getElementById('delete_account').value = "";
    document.getElementById('settingsmenu').style.visibility = 'visible';
    document.getElementById('settingsmenu_background').style.visibility = 'visible';
    database.ref('users/' + currentuser).once('value').then(function (snapshot) {
        document.getElementById('username_change').value = snapshot.val();
    });
}