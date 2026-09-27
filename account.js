const accountUsername =
    document.getElementById(
        "accountUsername"
    );

const accountRole =
    document.getElementById(
        "accountRole"
    );

const usernameValue =
    document.getElementById(
        "usernameValue"
    );

const roleValue =
    document.getElementById(
        "roleValue"
    );

const emailValue =
    document.getElementById(
        "emailValue"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const adminTools =
    document.getElementById(
        "adminTools"
    );


startAccountPage();


async function startAccountPage() {

    const ready =
        await initializeUser();


    if (!ready) {
        return;
    }


    renderAccount();
}


/* =========================================================
   عرض بيانات الحساب
========================================================= */

function renderAccount() {

    const isAdmin =
        currentProfile.role ===
        "admin";


    const roleText =
        isAdmin
            ? "مدير"
            : "عضو";


    accountUsername.textContent =
        currentProfile.username;


    accountRole.textContent =
        isAdmin
            ? "حساب المدير"
            : "حساب عضو";


    usernameValue.textContent =
        currentProfile.username;


    roleValue.textContent =
        roleText;


    emailValue.textContent =
        currentUser.email ||
        "غير متوفر";


    /*
        أدوات المدير
    */

    if (isAdmin) {

        adminTools.hidden =
            false;
    }
}


/* =========================================================
   تسجيل الخروج
========================================================= */

logoutBtn.addEventListener(
    "click",
    async function () {

        logoutBtn.disabled =
            true;


        logoutBtn.textContent =
            "جاري تسجيل الخروج...";


        await logoutUser();
    }
);