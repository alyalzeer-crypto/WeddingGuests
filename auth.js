const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const message =
    document.getElementById("message");


/* =========================================
   إذا كان المستخدم مسجلًا أصلًا
========================================= */

async function checkExistingSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        window.location.href =
            "dashboard.html";

    }
}

checkExistingSession();


/* =========================================
   تسجيل الدخول
========================================= */

loginBtn.addEventListener(
    "click",
    login
);


async function login() {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        showMessage(
            "يرجى إدخال البريد الإلكتروني وكلمة المرور",
            "error"
        );

        return;
    }


    loginBtn.disabled = true;

    loginBtn.textContent =
        "جاري تسجيل الدخول...";


    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    loginBtn.disabled = false;

    loginBtn.textContent =
        "تسجيل الدخول";


    if (error) {

        console.error(error);

        showMessage(
            "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            "error"
        );

        return;
    }


    if (data.session) {

        showMessage(
            "تم تسجيل الدخول بنجاح",
            "success"
        );


        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 500);

    }
}


/* =========================================
   Enter
========================================= */

passwordInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            login();

        }

    }
);


/* =========================================
   عرض الرسائل
========================================= */

function showMessage(
    text,
    type
) {

    message.textContent = text;

    message.className =
        "message " + type;

}