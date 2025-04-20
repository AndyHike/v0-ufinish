import { notFound } from "next/navigation"
import { getRequestConfig } from "next-intl/server"

// Define supported locales
export const locales = ["uk", "cs", "en"]
export const defaultLocale = "uk"

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound()
  }

  // Load messages for the requested locale
  return {
    messages: await getMessages(locale),
  }
})

// Function to get messages for a specific locale
async function getMessages(locale: string) {
  try {
    return {
      Header: {
        siteTitle: locale === "uk" ? "Ремонт Телефонів" : locale === "cs" ? "Oprava Telefonů" : "Phone Repair",
        home: locale === "uk" ? "Головна" : locale === "cs" ? "Domů" : "Home",
        services: locale === "uk" ? "Послуги" : locale === "cs" ? "Služby" : "Services",
        pricing: locale === "uk" ? "Ціни" : locale === "cs" ? "Ceník" : "Pricing",
        about: locale === "uk" ? "Про нас" : locale === "cs" ? "O nás" : "About",
        contact: locale === "uk" ? "Контакти" : locale === "cs" ? "Kontakt" : "Contact",
        openMenu: locale === "uk" ? "Відкрити меню" : locale === "cs" ? "Otevřít menu" : "Open menu",
        search: locale === "uk" ? "Пошук" : locale === "cs" ? "Hledat" : "Search",
      },
      // Rest of the translations (keeping them the same)
      Footer: {
        siteTitle: locale === "uk" ? "Ремонт Телефонів" : locale === "cs" ? "Oprava Telefonů" : "Phone Repair",
        description:
          locale === "uk"
            ? "Професійний ремонт мобільних телефонів з гарантією якості."
            : locale === "cs"
              ? "Profesionální oprava mobilních telefonů s garancí kvality."
              : "Professional mobile phone repair with quality guarantee.",
        quickLinks: locale === "uk" ? "Швидкі посилання" : locale === "cs" ? "Rychlé odkazy" : "Quick Links",
        home: locale === "uk" ? "Головна" : locale === "cs" ? "Domů" : "Home",
        services: locale === "uk" ? "Послуги" : locale === "cs" ? "Služby" : "Services",
        pricing: locale === "uk" ? "Ціни" : locale === "cs" ? "Ceník" : "Pricing",
        about: locale === "uk" ? "Про нас" : locale === "cs" ? "O nás" : "About",
        contact: locale === "uk" ? "Контакти" : locale === "cs" ? "Kontakt" : "Contact",
        contactUs: locale === "uk" ? "Зв'яжіться з нами" : locale === "cs" ? "Kontaktujte nás" : "Contact Us",
        address:
          locale === "uk"
            ? "вул. Хрещатик 1, Київ, Україна"
            : locale === "cs"
              ? "Václavské náměstí 1, Praha, Česká republika"
              : "Main Street 1, Kyiv, Ukraine",
        followUs: locale === "uk" ? "Слідкуйте за нами" : locale === "cs" ? "Sledujte nás" : "Follow Us",
        allRightsReserved:
          locale === "uk"
            ? "Всі права захищені."
            : locale === "cs"
              ? "Všechna práva vyhrazena."
              : "All rights reserved.",
      },
      UserNav: {
        login: locale === "uk" ? "Увійти" : locale === "cs" ? "Přihlásit se" : "Login",
        profile: locale === "uk" ? "Профіль" : locale === "cs" ? "Profil" : "Profile",
        orders: locale === "uk" ? "Замовлення" : locale === "cs" ? "Objednávky" : "Orders",
        adminDashboard:
          locale === "uk" ? "Панель адміністратора" : locale === "cs" ? "Administrátorský panel" : "Admin Dashboard",
        logout: locale === "uk" ? "Вийти" : locale === "cs" ? "Odhlásit se" : "Logout",
      },
      Search: {
        title: locale === "uk" ? "Пошук" : locale === "cs" ? "Hledat" : "Search",
        placeholder:
          locale === "uk"
            ? "Пошук телефонів, брендів..."
            : locale === "cs"
              ? "Hledat telefony, značky..."
              : "Search phones, brands...",
        search: locale === "uk" ? "Шукати" : locale === "cs" ? "Hledat" : "Search",
        clear: locale === "uk" ? "Очистити" : locale === "cs" ? "Vymazat" : "Clear",
        results: locale === "uk" ? "Результати" : locale === "cs" ? "Výsledky" : "Results",
        brand: locale === "uk" ? "Бренд" : locale === "cs" ? "Značka" : "Brand",
        model: locale === "uk" ? "Модель" : locale === "cs" ? "Model" : "Model",
        service: locale === "uk" ? "Послуга" : locale === "cs" ? "Služba" : "Service",
      },
      Hero: {
        title:
          locale === "uk"
            ? "Професійний ремонт мобільних телефонів"
            : locale === "cs"
              ? "Profesionální oprava mobilních telefonů"
              : "Professional Mobile Phone Repair",
        subtitle:
          locale === "uk"
            ? "Швидкий та якісний ремонт вашого телефону з гарантією. Довірте свій пристрій професіоналам."
            : locale === "cs"
              ? "Rychlá a kvalitní oprava vašeho telefonu s garancí. Svěřte svůj přístroj profesionálům."
              : "Fast and quality repair of your phone with warranty. Trust your device to professionals.",
        servicesButton: locale === "uk" ? "Наші послуги" : locale === "cs" ? "Naše služby" : "Our Services",
        contactButton: locale === "uk" ? "Зв'язатися" : locale === "cs" ? "Kontaktovat" : "Contact Us",
        feature1:
          locale === "uk" ? "Безкоштовна діагностика" : locale === "cs" ? "Bezplatná diagnostika" : "Free Diagnostics",
        feature2:
          locale === "uk"
            ? "Гарантія на всі ремонти"
            : locale === "cs"
              ? "Záruka na všechny opravy"
              : "Warranty on All Repairs",
        feature3:
          locale === "uk"
            ? "Швидкий ремонт протягом дня"
            : locale === "cs"
              ? "Rychlá oprava během dne"
              : "Same-Day Repair Service",
        imageAlt: locale === "uk" ? "Ремонт телефону" : locale === "cs" ? "Oprava telefonu" : "Phone Repair",
      },
      Services: {
        title: locale === "uk" ? "Наші послуги" : locale === "cs" ? "Naše služby" : "Our Services",
        subtitle:
          locale === "uk"
            ? "Ми пропонуємо широкий спектр послуг з ремонту мобільних телефонів."
            : locale === "cs"
              ? "Nabízíme širokou škálu služeb oprav mobilních telefonů."
              : "We offer a wide range of mobile phone repair services.",
        service1: {
          title: locale === "uk" ? "Заміна екрану" : locale === "cs" ? "Výměna displeje" : "Screen Replacement",
          description:
            locale === "uk"
              ? "Професійна заміна розбитого або пошкодженого екрану."
              : locale === "cs"
                ? "Profesionální výměna rozbitého nebo poškozeného displeje."
                : "Professional replacement of broken or damaged screens.",
        },
        service2: {
          title: locale === "uk" ? "Заміна батареї" : locale === "cs" ? "Výměna baterie" : "Battery Replacement",
          description:
            locale === "uk"
              ? "Відновлення тривалості роботи вашого телефону з новою батареєю."
              : locale === "cs"
                ? "Obnovení výdrže vašeho telefonu s novou baterií."
                : "Restore your phone's battery life with a new battery.",
        },
        service3: {
          title:
            locale === "uk"
              ? "Проблеми з підключенням"
              : locale === "cs"
                ? "Problémy s připojením"
                : "Connectivity Issues",
          description:
            locale === "uk"
              ? "Ремонт Wi-Fi, Bluetooth та інших проблем з підключенням."
              : locale === "cs"
                ? "Oprava Wi-Fi, Bluetooth a dalších problémů s připojením."
                : "Fix Wi-Fi, Bluetooth, and other connectivity issues.",
        },
        service4: {
          title: locale === "uk" ? "Захист від води" : locale === "cs" ? "Ochrana proti vodě" : "Water Damage",
          description:
            locale === "uk"
              ? "Відновлення телефонів після пошкодження водою."
              : locale === "cs"
                ? "Obnova telefonů po poškození vodou."
                : "Restore phones after water damage.",
        },
        learnMore: locale === "uk" ? "Дізнатися більше" : locale === "cs" ? "Zjistit více" : "Learn More",
        allServicesButton: locale === "uk" ? "Всі послуги" : locale === "cs" ? "Všechny služby" : "All Services",
      },
      Brands: {
        title:
          locale === "uk"
            ? "Бренди, з якими ми працюємо"
            : locale === "cs"
              ? "Značky, se kterými pracujeme"
              : "Brands We Work With",
        subtitle:
          locale === "uk"
            ? "Ми ремонтуємо телефони всіх популярних брендів."
            : locale === "cs"
              ? "Opravujeme telefony všech populárních značek."
              : "We repair phones of all popular brands.",
        allBrandsButton: locale === "uk" ? "Всі бренди" : locale === "cs" ? "Všechny značky" : "All Brands",
      },
      Testimonials: {
        title: locale === "uk" ? "Відгуки клієнтів" : locale === "cs" ? "Recenze zákazníků" : "Customer Testimonials",
        subtitle:
          locale === "uk"
            ? "Дізнайтеся, що кажуть наші клієнти про наші послуги."
            : locale === "cs"
              ? "Zjistěte, co říkají naši zákazníci o našich službách."
              : "See what our customers say about our services.",
        testimonial1: {
          name: locale === "uk" ? "Олександр Петренко" : locale === "cs" ? "Jan Novák" : "Alex Peterson",
          content:
            locale === "uk"
              ? "Дуже задоволений якістю ремонту. Мій iPhone працює як новий після заміни екрану."
              : locale === "cs"
                ? "Velmi spokojen s kvalitou opravy. Můj iPhone funguje jako nový po výměně displeje."
                : "Very satisfied with the quality of repair. My iPhone works like new after screen replacement.",
        },
        testimonial2: {
          name: locale === "uk" ? "Марія Коваленко" : locale === "cs" ? "Marie Svobodová" : "Maria Johnson",
          content:
            locale === "uk"
              ? "Швидкий та професійний сервіс. Замінили батарею за 30 хвилин, і тепер мій телефон тримає заряд цілий день."
              : locale === "cs"
                ? "Rychlý a profesionální servis. Vyměnili baterii za 30 minut a teď můj telefon vydrží celý den."
                : "Fast and professional service. They replaced the battery in 30 minutes, and now my phone lasts all day.",
        },
        testimonial3: {
          name: locale === "uk" ? "Іван Сидоренко" : locale === "cs" ? "Petr Dvořák" : "John Smith",
          content:
            locale === "uk"
              ? "Відмінний сервіс за розумною ціною. Рекомендую всім, хто має проблеми з телефоном."
              : locale === "cs"
                ? "Vynikající služby za rozumnou cenu. Doporučuji všem, kteří mají problémy s telefonem."
                : "Excellent service at a reasonable price. I recommend to anyone having phone issues.",
        },
        testimonial4: {
          name: locale === "uk" ? "Наталія Шевченко" : locale === "cs" ? "Lucie Nováková" : "Natalie Brown",
          content:
            locale === "uk"
              ? "Врятували мій телефон після того, як я впустила його у воду. Дуже вдячна за швидку допомогу!"
              : locale === "cs"
                ? "Zachránili můj telefon poté, co jsem ho upustila do vody. Velmi vděčná za rychlou pomoc!"
                : "They saved my phone after I dropped it in water. Very grateful for the quick help!",
        },
      },
      Contact: {
        title: locale === "uk" ? "Зв'яжіться з нами" : locale === "cs" ? "Kontaktujte nás" : "Contact Us",
        subtitle:
          locale === "uk"
            ? "Маєте питання? Напишіть нам, і ми зв'яжемося з вами якнайшвидше."
            : locale === "cs"
              ? "Máte otázky? Napište nám a my vás budeme kontaktovat co nejdříve."
              : "Have questions? Write to us and we will contact you as soon as possible.",
        phone: locale === "uk" ? "Телефон" : locale === "cs" ? "Telefon" : "Phone",
        email: locale === "uk" ? "Електронна пошта" : locale === "cs" ? "E-mail" : "Email",
        address: locale === "uk" ? "Адреса" : locale === "cs" ? "Adresa" : "Address",
        addressDetails:
          locale === "uk"
            ? "вул. Хрещатик 1, Київ, Україна"
            : locale === "cs"
              ? "Václavské náměstí 1, Praha, Česká republika"
              : "Main Street 1, Kyiv, Ukraine",
        mapTitle: locale === "uk" ? "Карта розташування" : locale === "cs" ? "Mapa umístění" : "Location Map",
        nameLabel: locale === "uk" ? "Ім'я" : locale === "cs" ? "Jméno" : "Name",
        namePlaceholder:
          locale === "uk" ? "Введіть ваше ім'я" : locale === "cs" ? "Zadejte své jméno" : "Enter your name",
        emailLabel: locale === "uk" ? "Електронна пошта" : locale === "cs" ? "E-mail" : "Email",
        emailPlaceholder:
          locale === "uk"
            ? "Введіть вашу електронну пошту"
            : locale === "cs"
              ? "Zadejte svůj e-mail"
              : "Enter your email",
        phoneLabel: locale === "uk" ? "Телефон" : locale === "cs" ? "Telefon" : "Phone",
        phonePlaceholder:
          locale === "uk"
            ? "Введіть ваш номер телефону"
            : locale === "cs"
              ? "Zadejte své telefonní číslo"
              : "Enter your phone number",
        messageLabel: locale === "uk" ? "Повідомлення" : locale === "cs" ? "Zpráva" : "Message",
        messagePlaceholder:
          locale === "uk"
            ? "Введіть ваше повідомлення"
            : locale === "cs"
              ? "Zadejte svou zprávu"
              : "Enter your message",
        send: locale === "uk" ? "Надіслати" : locale === "cs" ? "Odeslat" : "Send",
        sending: locale === "uk" ? "Надсилання..." : locale === "cs" ? "Odesílání..." : "Sending...",
        successTitle: locale === "uk" ? "Повідомлення надіслано" : locale === "cs" ? "Zpráva odeslána" : "Message Sent",
        successMessage:
          locale === "uk"
            ? "Дякуємо за ваше повідомлення. Ми зв'яжемося з вами якнайшвидше."
            : locale === "cs"
              ? "Děkujeme za vaši zprávu. Budeme vás kontaktovat co nejdříve."
              : "Thank you for your message. We will contact you as soon as possible.",
      },
      Auth: {
        signIn: locale === "uk" ? "Увійти" : locale === "cs" ? "Přihlásit se" : "Sign In",
        signUp: locale === "uk" ? "Зареєструватися" : locale === "cs" ? "Registrovat se" : "Sign Up",
        signInDescription:
          locale === "uk"
            ? "Увійдіть у свій обліковий запис"
            : locale === "cs"
              ? "Přihlaste se do svého účtu"
              : "Sign in to your account",
        signUpDescription:
          locale === "uk"
            ? "Створіть новий обліковий запис"
            : locale === "cs"
              ? "Vytvořte si nový účet"
              : "Create a new account",
        email: locale === "uk" ? "Email" : locale === "cs" ? "Email" : "Email",
        password: locale === "uk" ? "Пароль" : locale === "cs" ? "Heslo" : "Password",
        name: locale === "uk" ? "Ім'я" : locale === "cs" ? "Jméno" : "Name",
        fullName: locale === "uk" ? "Повне ім'я" : locale === "cs" ? "Celé jméno" : "Full name",
        forgotPassword:
          locale === "uk" ? "Забули пароль?" : locale === "cs" ? "Zapomněli jste heslo?" : "Forgot password?",
        signingIn: locale === "uk" ? "Вхід..." : locale === "cs" ? "Přihlašování..." : "Signing in...",
        signingUp: locale === "uk" ? "Реєстрація..." : locale === "cs" ? "Registrace..." : "Signing up...",
        error: locale === "uk" ? "Помилка" : locale === "cs" ? "Chyba" : "Error",
        invalidCredentials:
          locale === "uk"
            ? "Невірний email або пароль"
            : locale === "cs"
              ? "Nesprávný email nebo heslo"
              : "Invalid email or password",
        somethingWentWrong:
          locale === "uk" ? "Щось пішло не так" : locale === "cs" ? "Něco se pokazilo" : "Something went wrong",
        success: locale === "uk" ? "Успіх" : locale === "cs" ? "Úspěch" : "Success",
        accountCreated:
          locale === "uk" ? "Обліковий запис створено" : locale === "cs" ? "Účet byl vytvořen" : "Account created",
        registrationFailed:
          locale === "uk"
            ? "Не вдалося зареєструватися"
            : locale === "cs"
              ? "Registrace se nezdařila"
              : "Registration failed",
      },
      Login: {
        title: locale === "uk" ? "Вхід" : locale === "cs" ? "Přihlášení" : "Login",
        subtitle:
          locale === "uk"
            ? "Увійдіть у свій обліковий запис"
            : locale === "cs"
              ? "Přihlaste se do svého účtu"
              : "Sign in to your account",
        userTab: locale === "uk" ? "Користувач" : locale === "cs" ? "Uživatel" : "User",
        adminTab: locale === "uk" ? "Адміністратор" : locale === "cs" ? "Administrátor" : "Admin",
        userLoginTitle: locale === "uk" ? "Вхід користувача" : locale === "cs" ? "Přihlášení uživatele" : "User Login",
        userLoginDescription:
          locale === "uk"
            ? "Увійдіть як користувач"
            : locale === "cs"
              ? "Přihlaste se jako uživatel"
              : "Sign in as a user",
        adminLoginTitle:
          locale === "uk" ? "Вхід адміністратора" : locale === "cs" ? "Přihlášení administrátora" : "Admin Login",
        adminLoginDescription:
          locale === "uk"
            ? "Увійдіть як адміністратор"
            : locale === "cs"
              ? "Přihlaste se jako administrátor"
              : "Sign in as an admin",
        emailLabel: locale === "uk" ? "Email" : locale === "cs" ? "Email" : "Email",
        emailPlaceholder:
          locale === "uk" ? "name@example.com" : locale === "cs" ? "name@example.com" : "name@example.com",
        passwordLabel: locale === "uk" ? "Пароль" : locale === "cs" ? "Heslo" : "Password",
        passwordPlaceholder: locale === "uk" ? "••••••••" : locale === "cs" ? "••••••••" : "••••••••",
        forgotPassword:
          locale === "uk" ? "Забули пароль?" : locale === "cs" ? "Zapomněli jste heslo?" : "Forgot password?",
        login: locale === "uk" ? "Увійти" : locale === "cs" ? "Přihlásit se" : "Login",
        loggingIn: locale === "uk" ? "Вхід..." : locale === "cs" ? "Přihlašování..." : "Logging in...",
        noAccount:
          locale === "uk" ? "Немає облікового запису?" : locale === "cs" ? "Nemáte účet?" : "Don't have an account?",
        register: locale === "uk" ? "Зареєструватися" : locale === "cs" ? "Registrovat se" : "Register",
        showPassword: locale === "uk" ? "Показати пароль" : locale === "cs" ? "Zobrazit heslo" : "Show password",
        hidePassword: locale === "uk" ? "Приховати пароль" : locale === "cs" ? "Skrýt heslo" : "Hide password",
        successTitle: locale === "uk" ? "Успішний вхід" : locale === "cs" ? "Úspěšné přihlášení" : "Login Successful",
        userSuccessMessage:
          locale === "uk"
            ? "Ви успішно увійшли як користувач"
            : locale === "cs"
              ? "Úspěšně jste se přihlásili jako uživatel"
              : "You have successfully logged in as a user",
        adminSuccessMessage:
          locale === "uk"
            ? "Ви успішно увійшли як адміністратор"
            : locale === "cs"
              ? "Úspěšně jste se přihlásili jako administrátor"
              : "You have successfully logged in as an admin",
      },
      Profile: {
        title: locale === "uk" ? "Профіль" : locale === "cs" ? "Profil" : "Profile",
        subtitle:
          locale === "uk"
            ? "Керуйте своїм профілем та налаштуваннями"
            : locale === "cs"
              ? "Spravujte svůj profil a nastavení"
              : "Manage your profile and settings",
        personalInfo:
          locale === "uk" ? "Особиста інформація" : locale === "cs" ? "Osobní informace" : "Personal Information",
        personalInfoDescription:
          locale === "uk"
            ? "Оновіть свою особисту інформацію"
            : locale === "cs"
              ? "Aktualizujte své osobní údaje"
              : "Update your personal information",
        devices: locale === "uk" ? "Пристрої" : locale === "cs" ? "Zařízení" : "Devices",
        devicesDescription:
          locale === "uk"
            ? "Керуйте своїми пристроями"
            : locale === "cs"
              ? "Spravujte svá zařízení"
              : "Manage your devices",
        repairHistory: locale === "uk" ? "Історія ремонтів" : locale === "cs" ? "Historie oprav" : "Repair History",
        repairHistoryDescription:
          locale === "uk"
            ? "Перегляньте історію ваших ремонтів"
            : locale === "cs"
              ? "Zobrazte historii vašich oprav"
              : "View your repair history",
        billing: locale === "uk" ? "Оплата" : locale === "cs" ? "Platby" : "Billing",
        settings: locale === "uk" ? "Налаштування" : locale === "cs" ? "Nastavení" : "Settings",
        uploadAvatar: locale === "uk" ? "Завантажити аватар" : locale === "cs" ? "Nahrát avatar" : "Upload Avatar",
        nameLabel: locale === "uk" ? "Ім'я" : locale === "cs" ? "Jméno" : "Name",
        emailLabel: locale === "uk" ? "Email" : locale === "cs" ? "Email" : "Email",
        phoneLabel: locale === "uk" ? "Телефон" : locale === "cs" ? "Telefon" : "Phone",
        save: locale === "uk" ? "Зберегти" : locale === "cs" ? "Uložit" : "Save",
        saving: locale === "uk" ? "Збереження..." : locale === "cs" ? "Ukládání..." : "Saving...",
        profileUpdated:
          locale === "uk" ? "Профіль оновлено" : locale === "cs" ? "Profil aktualizován" : "Profile Updated",
        profileUpdatedDescription:
          locale === "uk"
            ? "Ваш профіль був успішно оновлений"
            : locale === "cs"
              ? "Váš profil byl úspěšně aktualizován"
              : "Your profile has been successfully updated",
        noDevices: locale === "uk" ? "Немає пристроїв" : locale === "cs" ? "Žádná zařízení" : "No Devices",
        noDevicesDescription:
          locale === "uk"
            ? "У вас ще немає зареєстрованих пристроїв"
            : locale === "cs"
              ? "Zatím nemáte žádná registrovaná zařízení"
              : "You don't have any registered devices yet",
        addDevice: locale === "uk" ? "Додати пристрій" : locale === "cs" ? "Přidat zařízení" : "Add Device",
        noRepairHistory:
          locale === "uk" ? "Немає історії ремонтів" : locale === "cs" ? "Žádná historie oprav" : "No Repair History",
        noRepairHistoryDescription:
          locale === "uk"
            ? "У вас ще немає історії ремонтів"
            : locale === "cs"
              ? "Zatím nemáte žádnou historii oprav"
              : "You don't have any repair history yet",
      },
      Admin: {
        adminPanel:
          locale === "uk" ? "Панель адміністратора" : locale === "cs" ? "Administrátorský panel" : "Admin Panel",
        dashboard: locale === "uk" ? "Панель" : locale === "cs" ? "Přehled" : "Dashboard",
        brands: locale === "uk" ? "Бренди" : locale === "cs" ? "Značky" : "Brands",
        models: locale === "uk" ? "Моделі" : locale === "cs" ? "Modely" : "Models",
        discounts: locale === "uk" ? "Знижки" : locale === "cs" ? "Slevy" : "Discounts",
        users: locale === "uk" ? "Користувачі" : locale === "cs" ? "Uživatelé" : "Users",
        settings: locale === "uk" ? "Налаштування" : locale === "cs" ? "Nastavení" : "Settings",
        logout: locale === "uk" ? "Вийти" : locale === "cs" ? "Odhlásit se" : "Logout",
        loggingOut: locale === "uk" ? "Вихід..." : locale === "cs" ? "Odhlašování..." : "Logging out...",
      },
      AdminDashboard: {
        title:
          locale === "uk" ? "Панель адміністратора" : locale === "cs" ? "Administrátorský panel" : "Admin Dashboard",
        subtitle:
          locale === "uk"
            ? "Керуйте брендами, моделями телефонів та знижками для користувачів."
            : locale === "cs"
              ? "Spravujte značky, modely telefonů a slevy pro uživatele."
              : "Manage brands, phone models, and discounts for users.",
        overview: locale === "uk" ? "Огляд" : locale === "cs" ? "Přehled" : "Overview",
        analytics: locale === "uk" ? "Аналітика" : locale === "cs" ? "Analytika" : "Analytics",
        reports: locale === "uk" ? "Звіти" : locale === "cs" ? "Reporty" : "Reports",
        totalBrands: locale === "uk" ? "Всього брендів" : locale === "cs" ? "Celkem značek" : "Total Brands",
        totalModels: locale === "uk" ? "Всього моделей" : locale === "cs" ? "Celkem modelů" : "Total Models",
        totalUsers: locale === "uk" ? "Всього користувачів" : locale === "cs" ? "Celkem uživatelů" : "Total Users",
        totalRepairs: locale === "uk" ? "Всього ремонтів" : locale === "cs" ? "Celkem oprav" : "Total Repairs",
        fromLastMonth:
          locale === "uk" ? "з минулого місяця" : locale === "cs" ? "od minulého měsíce" : "from last month",
        repairsOverTime:
          locale === "uk" ? "Ремонти за період" : locale === "cs" ? "Opravy za období" : "Repairs Over Time",
        recentActivity:
          locale === "uk" ? "Остання активність" : locale === "cs" ? "Nedávná aktivita" : "Recent Activity",
        recentActivityDescription:
          locale === "uk"
            ? "Останні дії в системі"
            : locale === "cs"
              ? "Nedávné akce v systému"
              : "Recent actions in the system",
        activityTitle: locale === "uk" ? "Активність #{id}" : locale === "cs" ? "Aktivita #{id}" : "Activity #{id}",
        activityTime:
          locale === "uk"
            ? "{minutes} хвилин тому"
            : locale === "cs"
              ? "před {minutes} minutami"
              : "{minutes} minutes ago",
        chartPlaceholder:
          locale === "uk" ? "Графік буде тут" : locale === "cs" ? "Graf bude zde" : "Chart will be here",
        analyticsTitle: locale === "uk" ? "Аналітика" : locale === "cs" ? "Analytika" : "Analytics",
        analyticsDescription:
          locale === "uk"
            ? "Аналітичні дані будуть доступні незабаром"
            : locale === "cs"
              ? "Analytická data budou brzy k dispozici"
              : "Analytics data will be available soon",
        reportsTitle: locale === "uk" ? "Звіти" : locale === "cs" ? "Reporty" : "Reports",
        reportsDescription:
          locale === "uk"
            ? "Звіти будуть доступні незабаром"
            : locale === "cs"
              ? "Reporty budou brzy k dispozici"
              : "Reports will be available soon",
      },
      AdminBrands: {
        title: locale === "uk" ? "Бренди" : locale === "cs" ? "Značky" : "Brands",
        subtitle:
          locale === "uk"
            ? "Керуйте брендами телефонів"
            : locale === "cs"
              ? "Spravujte značky telefonů"
              : "Manage phone brands",
        addBrand: locale === "uk" ? "Додати бренд" : locale === "cs" ? "Přidat značku" : "Add Brand",
        addBrandTitle:
          locale === "uk" ? "Додати новий бренд" : locale === "cs" ? "Přidat novou značku" : "Add New Brand",
        addBrandDescription:
          locale === "uk"
            ? "Додайте новий бренд телефону до системи"
            : locale === "cs"
              ? "Přidejte novou značku telefonu do systému"
              : "Add a new phone brand to the system",
        brandNameLabel: locale === "uk" ? "Назва бренду" : locale === "cs" ? "Název značky" : "Brand Name",
        brandNamePlaceholder:
          locale === "uk" ? "Введіть назву бренду" : locale === "cs" ? "Zadejte název značky" : "Enter brand name",
        searchPlaceholder:
          locale === "uk" ? "Пошук брендів..." : locale === "cs" ? "Hledat značky..." : "Search brands...",
        brandName: locale === "uk" ? "Назва бренду" : locale === "cs" ? "Název značky" : "Brand Name",
        models: locale === "uk" ? "Моделі" : locale === "cs" ? "Modely" : "Models",
        actions: locale === "uk" ? "Дії" : locale === "cs" ? "Akce" : "Actions",
        openMenu: locale === "uk" ? "Відкрити меню" : locale === "cs" ? "Otevřít menu" : "Open Menu",
        edit: locale === "uk" ? "Редагувати" : locale === "cs" ? "Upravit" : "Edit",
        delete: locale === "uk" ? "Видалити" : locale === "cs" ? "Smazat" : "Delete",
        cancel: locale === "uk" ? "Скасувати" : locale === "cs" ? "Zrušit" : "Cancel",
        add: locale === "uk" ? "Додати" : locale === "cs" ? "Přidat" : "Add",
        adding: locale === "uk" ? "Додавання..." : locale === "cs" ? "Přidávání..." : "Adding...",
        save: locale === "uk" ? "Зберегти" : locale === "cs" ? "Uložit" : "Save",
        saving: locale === "uk" ? "Збереження..." : locale === "cs" ? "Ukládání..." : "Saving...",
        deleting: locale === "uk" ? "Видалення..." : locale === "cs" ? "Mazání..." : "Deleting...",
        editBrandTitle: locale === "uk" ? "Редагувати бренд" : locale === "cs" ? "Upravit značku" : "Edit Brand",
        editBrandDescription:
          locale === "uk"
            ? "Оновіть інформацію про бренд"
            : locale === "cs"
              ? "Aktualizujte informace o značce"
              : "Update brand information",
        deleteBrandTitle: locale === "uk" ? "Видалити бренд" : locale === "cs" ? "Smazat značku" : "Delete Brand",
        deleteBrandDescription:
          locale === "uk"
            ? "Ви впевнені, що хочете видалити бренд {name}?"
            : locale === "cs"
              ? "Jste si jisti, že chcete smazat značku {name}?"
              : "Are you sure you want to delete the brand {name}?",
        brandAdded: locale === "uk" ? "Бренд додано" : locale === "cs" ? "Značka přidána" : "Brand Added",
        brandAddedDescription:
          locale === "uk"
            ? "Бренд {name} успішно додано"
            : locale === "cs"
              ? "Značka {name} byla úspěšně přidána"
              : "Brand {name} has been successfully added",
        brandUpdated: locale === "uk" ? "Бренд оновлено" : locale === "cs" ? "Značka aktualizována" : "Brand Updated",
        brandUpdatedDescription:
          locale === "uk"
            ? "Бренд {name} успішно оновлено"
            : locale === "cs"
              ? "Značka {name} byla úspěšně aktualizována"
              : "Brand {name} has been successfully updated",
        brandDeleted: locale === "uk" ? "Бренд видалено" : locale === "cs" ? "Značka smazána" : "Brand Deleted",
        brandDeletedDescription:
          locale === "uk"
            ? "Бренд {name} успішно видалено"
            : locale === "cs"
              ? "Značka {name} byla úspěšně smazána"
              : "Brand {name} has been successfully deleted",
        noSearchResults:
          locale === "uk"
            ? "Немає результатів пошуку"
            : locale === "cs"
              ? "Žádné výsledky vyhledávání"
              : "No search results",
        noBrands: locale === "uk" ? "Немає брендів" : locale === "cs" ? "Žádné značky" : "No brands",
      },
      AdminModels: {
        title: locale === "uk" ? "Моделі" : locale === "cs" ? "Modely" : "Models",
        subtitle:
          locale === "uk"
            ? "Керуйте моделями телефонів"
            : locale === "cs"
              ? "Spravujte modely telefonů"
              : "Manage phone models",
        addModel: locale === "uk" ? "Додати модель" : locale === "cs" ? "Přidat model" : "Add Model",
        addModelTitle: locale === "uk" ? "Додати нову модель" : locale === "cs" ? "Přidat nový model" : "Add New Model",
        addModelDescription:
          locale === "uk"
            ? "Додайте нову модель телефону до системи"
            : locale === "cs"
              ? "Přidejte nový model telefonu do systému"
              : "Add a new phone model to the system",
        modelNameLabel: locale === "uk" ? "Назва моделі" : locale === "cs" ? "Název modelu" : "Model Name",
        modelNamePlaceholder:
          locale === "uk" ? "Введіть назву моделі" : locale === "cs" ? "Zadejte název modelu" : "Enter model name",
        brandLabel: locale === "uk" ? "Бренд" : locale === "cs" ? "Značka" : "Brand",
        selectBrand: locale === "uk" ? "Виберіть бренд" : locale === "cs" ? "Vyberte značku" : "Select brand",
        yearLabel: locale === "uk" ? "Рік випуску" : locale === "cs" ? "Rok vydání" : "Year",
        yearPlaceholder:
          locale === "uk" ? "Введіть рік випуску" : locale === "cs" ? "Zadejte rok vydání" : "Enter year",
        searchPlaceholder:
          locale === "uk" ? "Пошук моделей..." : locale === "cs" ? "Hledat modely..." : "Search models...",
        filterByBrand:
          locale === "uk" ? "Фільтрувати за брендом" : locale === "cs" ? "Filtrovat podle značky" : "Filter by brand",
        allBrands: locale === "uk" ? "Всі бренди" : locale === "cs" ? "Všechny značky" : "All brands",
        modelName: locale === "uk" ? "Назва моделі" : locale === "cs" ? "Název modelu" : "Model Name",
        brand: locale === "uk" ? "Бренд" : locale === "cs" ? "Značka" : "Brand",
        year: locale === "uk" ? "Рік" : locale === "cs" ? "Rok" : "Year",
        repairCount: locale === "uk" ? "Кількість ремонтів" : locale === "cs" ? "Počet oprav" : "Repair Count",
        actions: locale === "uk" ? "Дії" : locale === "cs" ? "Akce" : "Actions",
        openMenu: locale === "uk" ? "Відкрити меню" : locale === "cs" ? "Otevřít menu" : "Open Menu",
        edit: locale === "uk" ? "Редагувати" : locale === "cs" ? "Upravit" : "Edit",
        delete: locale === "uk" ? "Видалити" : locale === "cs" ? "Smazat" : "Delete",
        cancel: locale === "uk" ? "Скасувати" : locale === "cs" ? "Zrušit" : "Cancel",
        add: locale === "uk" ? "Додати" : locale === "cs" ? "Přidat" : "Add",
        adding: locale === "uk" ? "Додавання..." : locale === "cs" ? "Přidávání..." : "Adding...",
        save: locale === "uk" ? "Зберегти" : locale === "cs" ? "Uložit" : "Save",
        saving: locale === "uk" ? "Збереження..." : locale === "cs" ? "Ukládání..." : "Saving...",
        deleting: locale === "uk" ? "Видалення..." : locale === "cs" ? "Mazání..." : "Deleting...",
        editModelTitle: locale === "uk" ? "Редагувати модель" : locale === "cs" ? "Upravit model" : "Edit Model",
        editModelDescription:
          locale === "uk"
            ? "Оновіть інформацію про модель"
            : locale === "cs"
              ? "Aktualizujte informace o modelu"
              : "Update model information",
        deleteModelTitle: locale === "uk" ? "Видалити модель" : locale === "cs" ? "Smazat model" : "Delete Model",
        deleteModelDescription:
          locale === "uk"
            ? "Ви впевнені, що хочете видалити модель {name}?"
            : locale === "cs"
              ? "Jste si jisti, že chcete smazat model {name}?"
              : "Are you sure you want to delete the model {name}?",
        modelAdded: locale === "uk" ? "Модель додано" : locale === "cs" ? "Model přidán" : "Model Added",
        modelAddedDescription:
          locale === "uk"
            ? "Модель {name} успішно додано"
            : locale === "cs"
              ? "Model {name} byl úspěšně přidán"
              : "Model {name} has been successfully added",
        modelUpdated: locale === "uk" ? "Модель оновлено" : locale === "cs" ? "Model aktualizován" : "Model Updated",
        modelUpdatedDescription:
          locale === "uk"
            ? "Модель {name} успішно оновлено"
            : locale === "cs"
              ? "Model {name} byl úspěšně aktualizován"
              : "Model {name} has been successfully updated",
        modelDeleted: locale === "uk" ? "Модель видалено" : locale === "cs" ? "Model smazán" : "Model Deleted",
        modelDeletedDescription:
          locale === "uk"
            ? "Модель {name} успішно видалено"
            : locale === "cs"
              ? "Model {name} byl úspěšně smazán"
              : "Model {name} has been successfully deleted",
        noSearchResults:
          locale === "uk"
            ? "Немає результатів пошуку"
            : locale === "cs"
              ? "Žádné výsledky vyhledávání"
              : "No search results",
        noModels: locale === "uk" ? "Немає моделей" : locale === "cs" ? "Žádné modely" : "No models",
      },
      AdminDiscounts: {
        title: locale === "uk" ? "Знижки" : locale === "cs" ? "Slevy" : "Discounts",
        subtitle:
          locale === "uk"
            ? "Керуйте знижками для користувачів"
            : locale === "cs"
              ? "Spravujte slevy pro uživatele"
              : "Manage discounts for users",
        addDiscount: locale === "uk" ? "Додати знижку" : locale === "cs" ? "Přidat slevu" : "Add Discount",
        addDiscountTitle:
          locale === "uk" ? "Додати нову знижку" : locale === "cs" ? "Přidat novou slevu" : "Add New Discount",
        addDiscountDescription:
          locale === "uk"
            ? "Додайте нову знижку для користувача"
            : locale === "cs"
              ? "Přidejte novou slevu pro uživatele"
              : "Add a new discount for a user",
        userLabel: locale === "uk" ? "Користувач" : locale === "cs" ? "Uživatel" : "User",
        selectUser: locale === "uk" ? "Виберіть користувача" : locale === "cs" ? "Vyberte uživatele" : "Select user",
        codeLabel: locale === "uk" ? "Код знижки" : locale === "cs" ? "Kód slevy" : "Discount Code",
        codePlaceholder:
          locale === "uk" ? "Введіть код знижки" : locale === "cs" ? "Zadejte kód slevy" : "Enter discount code",
        percentageLabel:
          locale === "uk" ? "Відсоток знижки" : locale === "cs" ? "Procento slevy" : "Discount Percentage",
        percentagePlaceholder:
          locale === "uk"
            ? "Введіть відсоток знижки"
            : locale === "cs"
              ? "Zadejte procento slevy"
              : "Enter discount percentage",
        expiresAtLabel: locale === "uk" ? "Дійсна до" : locale === "cs" ? "Platná do" : "Expires At",
        searchPlaceholder:
          locale === "uk" ? "Пошук знижок..." : locale === "cs" ? "Hledat slevy..." : "Search discounts...",
        code: locale === "uk" ? "Код" : locale === "cs" ? "Kód" : "Code",
        user: locale === "uk" ? "Користувач" : locale === "cs" ? "Uživatel" : "User",
        percentage: locale === "uk" ? "Відсоток" : locale === "cs" ? "Procento" : "Percentage",
        expiresAt: locale === "uk" ? "Дійсна до" : locale === "cs" ? "Platná do" : "Expires At",
        actions: locale === "uk" ? "Дії" : locale === "cs" ? "Akce" : "Actions",
        openMenu: locale === "uk" ? "Відкрити меню" : locale === "cs" ? "Otevřít menu" : "Open Menu",
        edit: locale === "uk" ? "Редагувати" : locale === "cs" ? "Upravit" : "Edit",
        delete: locale === "uk" ? "Видалити" : locale === "cs" ? "Smazat" : "Delete",
        cancel: locale === "uk" ? "Скасувати" : locale === "cs" ? "Zrušit" : "Cancel",
        add: locale === "uk" ? "Додати" : locale === "cs" ? "Přidat" : "Add",
        adding: locale === "uk" ? "Додавання..." : locale === "cs" ? "Přidávání..." : "Adding...",
        save: locale === "uk" ? "Зберегти" : locale === "cs" ? "Uložit" : "Save",
        saving: locale === "uk" ? "Збереження..." : locale === "cs" ? "Ukládání..." : "Saving...",
        deleting: locale === "uk" ? "Видалення..." : locale === "cs" ? "Mazání..." : "Deleting...",
        editDiscountTitle: locale === "uk" ? "Редагувати знижку" : locale === "cs" ? "Upravit slevu" : "Edit Discount",
        editDiscountDescription:
          locale === "uk"
            ? "Оновіть інформацію про знижку"
            : locale === "cs"
              ? "Aktualizujte informace o slevě"
              : "Update discount information",
        deleteDiscountTitle: locale === "uk" ? "Видалити знижку" : locale === "cs" ? "Smazat slevu" : "Delete Discount",
        deleteDiscountDescription:
          locale === "uk"
            ? "Ви впевнені, що хочете видалити знижку з кодом {code}?"
            : locale === "cs"
              ? "Jste si jisti, že chcete smazat slevu s kódem {code}?"
              : "Are you sure you want to delete the discount with code {code}?",
        discountAdded: locale === "uk" ? "Знижку додано" : locale === "cs" ? "Sleva přidána" : "Discount Added",
        discountAddedDescription:
          locale === "uk"
            ? "Знижку з кодом {code} успішно додано"
            : locale === "cs"
              ? "Sleva s kódem {code} byla úspěšně přidána"
              : "Discount with code {code} has been successfully added",
        discountUpdated:
          locale === "uk" ? "Знижку оновлено" : locale === "cs" ? "Sleva aktualizována" : "Discount Updated",
        discountUpdatedDescription:
          locale === "uk"
            ? "Знижку з кодом {code} успішно оновлено"
            : locale === "cs"
              ? "Sleva s kódem {code} byla úspěšně aktualizována"
              : "Discount with code {code} has been successfully updated",
        discountDeleted: locale === "uk" ? "Знижку видалено" : locale === "cs" ? "Sleva smazána" : "Discount Deleted",
        discountDeletedDescription:
          locale === "uk"
            ? "Знижку з кодом {code} успішно видалено"
            : locale === "cs"
              ? "Sleva s kódem {code} byla úspěšně smazána"
              : "Discount with code {code} has been successfully deleted",
        noSearchResults:
          locale === "uk"
            ? "Немає результатів пошуку"
            : locale === "cs"
              ? "Žádné výsledky vyhledávání"
              : "No search results",
        noDiscounts: locale === "uk" ? "Немає знижок" : locale === "cs" ? "Žádné slevy" : "No discounts",
      },
    }
  } catch (error) {
    console.error("Error loading messages:", error)
    return {} // Return empty object in case of error to prevent build failures
  }
}
