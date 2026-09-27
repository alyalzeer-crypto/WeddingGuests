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

    const roleText =
        currentProfile.role ===
        "admin"
            ? "مدير"
            : "عضو";


    accountUsername.textContent =
        currentProfile.username;


    accountRole.textContent =
        currentProfile.role ===
        "admin"
            ? "حساب المدير"
            : "حساب عضو";


    usernameValue.textContent =
        currentProfile.username;


    roleValue.textContent =
        roleText;


    emailValue.textContent =
        currentUser.email || "غير متوفر";
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