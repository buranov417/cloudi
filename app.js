// App_ready_for_GitHub_full.js
const { useState, useEffect } = React;

function App() {
  // State management
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [allDuas, setAllDuas] = useState([]);
  const [currentDuaId, setCurrentDuaId] = useState(null);
  const [currentHadith, setCurrentHadith] = useState(null);
  const [message, setMessage] = useState(null);
  const [duaText, setDuaText] = useState("");
  const [category, setCategory] = useState("Учёба");
  const [showReminder, setShowReminder] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupRecoveryWord, setSignupRecoveryWord] = useState("");
  const [signupConfirmRecoveryWord, setSignupConfirmRecoveryWord] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [signupError, setSignupError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousUserDuas, setPreviousUserDuas] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  // Recovery state
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [recoveryWord, setRecoveryWord] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [recoveryError, setRecoveryError] = useState(null);
  const [recoverySuccess, setRecoverySuccess] = useState(null);
  // Admin state
  const [adminScreen, setAdminScreen] = useState("stats");
  const [complaints, setComplaints] = useState([]);

  // Predefined hadiths and Quran verses
  const hadiths = [
    {
      id: 1,
      text: "Дуа — это сущность поклонения.",
      source: "Хадис, Тирмизи",
    },
    {
      id: 2,
      text: "Воистину, Аллах стыдится от раба Своего, когда тот поднимает руки к Нему в дуа, чтобы вернуть их пустыми и униженными.",
      source: "Хадис, Абу Дауд",
    },
    {
      id: 3,
      text: "Просите Аллаха о благополучии в этом мире и в Последней жизни.",
      source: "Коран, 7:156",
    },
    {
      id: 4,
      text: "Когда Муса пришел к огню и был призван: «Благословен тот, кто находится у огня и тот, кто вокруг него!»",
      source: "Коран, 27:8",
    },
    {
      id: 5,
      text: "Мой Господь, поистине, я нуждаюсь в том благе, которое Ты ниспосылаешь мне.",
      source: "Коран, 28:24",
    },
  ];

  // Сброс предыдущих дуа при смене пользователя
  useEffect(() => {
    if (currentUser) {
      setPreviousUserDuas([]);
    }
  }, [currentUser]);

  // Отслеживание увеличения счетчика дуа пользователя в реальном времени
  useEffect(() => {
    if (!currentUser || allDuas.length === 0) return;
    
    const currentUserDuas = allDuas.filter(dua => dua.submittedByUserId === currentUser.id);
    
    // Пропускаем первую загрузку для этого пользователя
    if (previousUserDuas.length === 0) {
      setPreviousUserDuas(currentUserDuas);
      return;
    }
    
    // Проверяем, увеличился ли счетчик хотя бы в одном дуа
    let hasIncrease = false;
    let increaseCount = 0;
    
    currentUserDuas.forEach(currentDua => {
      const prevDua = previousUserDuas.find(d => d.id === currentDua.id);
      if (prevDua && currentDua.count > prevDua.count) {
        hasIncrease = true;
        increaseCount += (currentDua.count - prevDua.count);
      }
    });
    
    if (hasIncrease) {
      const notificationMessage = `✨ Кто-то сделал дуа за вас! (+${increaseCount})`;
      setMessage(notificationMessage);
      
      // Показываем браузерное уведомление, если разрешено
      if (notificationPermission === "granted") {
        new Notification("Cohesive-Umma", {
          body: notificationMessage,
          icon: "🤲"
        });
      }
      
      setTimeout(() => setMessage(null), 6000);
    }
    
    setPreviousUserDuas(currentUserDuas);
  }, [allDuas, currentUser, previousUserDuas, notificationPermission]);

  // Запрос разрешения на уведомления при первом взаимодействии
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  };

  // Эмуляция базы данных
  const emulateDatabase = () => {
    // Initialize complaints if not exists
    if (!localStorage.getItem("cohesiveUmmaComplaints")) {
      localStorage.setItem("cohesiveUmmaComplaints", JSON.stringify([]));
    }
    
    const storedUsers = JSON.parse(localStorage.getItem("cohesiveUmmaUsers")) || [];
    const storedDuas = JSON.parse(localStorage.getItem("cohesiveUmmaDuas")) || [];
    const storedComplaints = JSON.parse(localStorage.getItem("cohesiveUmmaComplaints")) || [];
    
    setUsers(storedUsers);
    setAllDuas(storedDuas);
    setComplaints(storedComplaints);
    setIsLoading(false);
    
    // Эмуляция реального времени - обновление при изменении localStorage
    const handleStorageChange = (event) => {
      if (event.key === "cohesiveUmmaDuas") {
        setAllDuas(JSON.parse(event.newValue || "[]"));
      }
      if (event.key === "cohesiveUmmaUsers") {
        setUsers(JSON.parse(event.newValue || "[]"));
      }
      if (event.key === "cohesiveUmmaComplaints") {
        setComplaints(JSON.parse(event.newValue || "[]"));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  };

  // Загрузка данных при старте приложения
  useEffect(() => {
    const cleanup = emulateDatabase();
    
    // Эмуляция напоминаний
    const reminderInterval = setInterval(() => {
      setShowReminder(true);
      setTimeout(() => setShowReminder(false), 5000);
    }, 30000);
    
    return () => {
      clearInterval(reminderInterval);
      cleanup?.();
    };
  }, []);

  // Инициализация текущего дуа и хадиса при входе пользователя
  useEffect(() => {
    if (currentUser && !isLoading) {
      loadNewDuaAndHadith();
      requestNotificationPermission();
    }
  }, [currentUser, isLoading]);

  // Загрузка нового дуа и хадиса
  const loadNewDuaAndHadith = () => {
    if (!currentUser) return;
    
    // Фильтруем только настоящие дуа от других пользователей
    const othersDuas = allDuas.filter(
      (dua) => 
        dua.submittedByUserId !== currentUser.id && 
        dua.isApproved
    );
    
    if (othersDuas.length > 0) {
      const randomIndex = Math.floor(Math.random() * othersDuas.length);
      setCurrentDuaId(othersDuas[randomIndex].id);
    } else {
      setCurrentDuaId(null);
    }
    
    // Случайный хадис
    if (hadiths.length > 0) {
      const randomIndex = Math.floor(Math.random() * hadiths.length);
      setCurrentHadith(hadiths[randomIndex]);
    }
  };

  // Сохранение данных в эмулированную БД
  const saveToDatabase = (collectionName, data) => {
    if (collectionName === "users") {
      const updatedUsers = [...users, data];
      localStorage.setItem("cohesiveUmmaUsers", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } else if (collectionName === "duas") {
      const updatedDuas = [...allDuas, data];
      localStorage.setItem("cohesiveUmmaDuas", JSON.stringify(updatedDuas));
      setAllDuas(updatedDuas);
      
      // Эмуляция реального времени для других вкладок
      localStorage.setItem("cohesiveUmmaDuasUpdate", Date.now().toString());
      window.dispatchEvent(new Event("storage"));
    } else if (collectionName === "complaints") {
      const updatedComplaints = [...complaints, data];
      localStorage.setItem("cohesiveUmmaComplaints", JSON.stringify(updatedComplaints));
      setComplaints(updatedComplaints);
      
      localStorage.setItem("cohesiveUmmaComplaintsUpdate", Date.now().toString());
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Обновление данных в эмулированной БД
  const updateInDatabase = (collectionName, itemId, updates) => {
    if (collectionName === "duas") {
      const updatedDuas = allDuas.map(dua => 
        dua.id === itemId ? {...dua, ...updates} : dua
      );
      localStorage.setItem("cohesiveUmmaDuas", JSON.stringify(updatedDuas));
      setAllDuas(updatedDuas);
      
      // Эмуляция реального времени
      localStorage.setItem("cohesiveUmmaDuasUpdate", Date.now().toString());
      window.dispatchEvent(new Event("storage"));
    } else if (collectionName === "users") {
      const updatedUsers = users.map(user => 
        user.id === itemId ? {...user, ...updates} : user
      );
      localStorage.setItem("cohesiveUmmaUsers", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Обновляем текущего пользователя если нужно
      if (currentUser?.id === itemId) {
        setCurrentUser({...currentUser, ...updates});
      }
    }
  };

  // Обработка входа
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);
    
    try {
      const user = users.find(
        (u) => u.username === loginUsername && u.password === loginPassword
      );
      
      if (user) {
        setCurrentUser(user);
        setScreen("main");
        setMessage(`Добро пожаловать, ${user.username}!`);
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Неверное имя пользователя или пароль");
      }
    } catch (error) {
      setLoginError(error.message || "Ошибка входа");
      setTimeout(() => setLoginError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка регистрации
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError(null);
    setIsLoading(true);
    
    try {
      // Проверка уникальности имени пользователя
      if (users.some((u) => u.username === signupUsername)) {
        throw new Error("Это имя пользователя уже занято");
      }
      
      // Проверка совпадения паролей
      if (signupPassword !== signupConfirmPassword) {
        throw new Error("Пароли не совпадают");
      }
      
      // Проверка совпадения кодовых слов
      if (signupRecoveryWord !== signupConfirmRecoveryWord) {
        throw new Error("Кодовые слова не совпадают");
      }
      
      // Создание нового пользователя
      const newUser = {
        id: Date.now().toString(),
        username: signupUsername,
        password: signupPassword,
        recoveryWord: signupRecoveryWord,
        isAdmin: false,
        history: [],
        notifications: [],
        createdAt: new Date().toISOString(),
      };
      
      // Сохранение в БД
      await saveToDatabase("users", newUser);
      
      // Установка текущего пользователя
      setCurrentUser(newUser);
      setScreen("main");
      setMessage(`Добро пожаловать, ${signupUsername}! Ваш аккаунт создан.`);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setSignupError(error.message || "Ошибка регистрации");
      setTimeout(() => setSignupError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Восстановление пароля
  const handleRecovery = async (e) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);
    setIsLoading(true);
    
    try {
      const user = users.find(u => u.username === recoveryUsername);
      
      if (!user) {
        throw new Error("Пользователь не найден");
      }
      
      if (user.recoveryWord !== recoveryWord) {
        throw new Error("Неверное кодовое слово");
      }
      
      if (newPassword !== confirmNewPassword) {
        throw new Error("Новые пароли не совпадают");
      }
      
      // Обновление пароля
      const updatedUsers = users.map(u => 
        u.username === recoveryUsername ? {...u, password: newPassword} : u
      );
      
      localStorage.setItem("cohesiveUmmaUsers", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      setRecoverySuccess("Пароль успешно изменен! Теперь вы можете войти.");
      setTimeout(() => {
        setScreen("login");
        setRecoverySuccess(null);
      }, 3000);
    } catch (error) {
      setRecoveryError(error.message || "Ошибка восстановления пароля");
      setTimeout(() => setRecoveryError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка выхода
  const handleLogout = async () => {
    try {
      setCurrentUser(null);
      setScreen("login");
      setMessage("Вы вышли из аккаунта");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  // Обработка "Сделано"
  const handleDone = async () => {
    if (!currentUser || !currentDuaId) return;
    
    const currentDua = allDuas.find((dua) => dua.id === currentDuaId);
    if (!currentDua) return;
    
    // Обновление счетчика дуа в БД
    const updatedCount = currentDua.count + 1;
    await updateInDatabase("duas", currentDuaId, {
      count: updatedCount
    });
    
    // Добавление в историю текущего пользователя
    const newHistoryItem = {
      id: Date.now().toString(),
      duaId: currentDuaId,
      duaText: currentDua.text,
      action: "done",
      timestamp: new Date().toISOString(),
      category: currentDua.category,
    };
    
    // Обновление истории пользователя в БД
    const updatedHistory = [...(currentUser.history || []), newHistoryItem];
    await updateInDatabase("users", currentUser.id, {
      history: updatedHistory
    });
    
    // Обновление локального состояния текущего пользователя
    setCurrentUser(prev => prev ? {...prev, history: updatedHistory} : null);
    
    // Расчет статистики
    const totalForMe = allDuas
      .filter((dua) => dua.submittedByUserId === currentUser.id)
      .reduce((sum, dua) => sum + dua.count, 0);
    
    setMessage(`Спасибо! Также за вас сделали дуа: ${totalForMe} раз`);
    setTimeout(() => setMessage(null), 4000);
    
    // Загрузка нового дуа
    loadNewDuaAndHadith();
  };

  // Обработка "Пропустить"
  const handleSkip = () => {
    if (!currentUser || !currentDuaId) return;
    
    const currentDua = allDuas.find((dua) => dua.id === currentDuaId);
    if (currentDua) {
      const newHistoryItem = {
        id: Date.now().toString(),
        duaId: currentDuaId,
        duaText: currentDua.text,
        action: "skip",
        timestamp: new Date().toISOString(),
        category: currentDua.category,
      };
      
      const updatedHistory = [...(currentUser.history || []), newHistoryItem];
      updateInDatabase("users", currentUser.id, { history: updatedHistory });
      setCurrentUser(prev => prev ? {...prev, history: updatedHistory} : null);
    }
    
    loadNewDuaAndHadith();
  };

  // Обработка "Жалоба"
  const handleReport = () => {
    if (!currentUser || !currentDuaId) return;
    
    const currentDua = allDuas.find((dua) => dua.id === currentDuaId);
    if (!currentDua) return;
    
    const newComplaint = {
      id: Date.now().toString(),
      duaId: currentDuaId,
      duaText: currentDua.text,
      submittedByUsername: currentDua.submittedByUsername || "Аноним",
      reportedBy: currentUser.username,
      timestamp: new Date().toISOString(),
    };
    
    saveToDatabase("complaints", newComplaint);
    
    setMessage("Жалоба отправлена");
    setTimeout(() => setMessage(null), 3000);
    
    // Загрузка нового дуа после жалобы
    loadNewDuaAndHadith();
  };

  // Отправка нового дуа
  const handleSubmitDua = async (e) => {
    e.preventDefault();
    if (!duaText.trim() || !currentUser || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const newDua = {
        id: Date.now().toString(),
        text: duaText.trim(),
        category: category,
        count: 0,
        submittedByUserId: currentUser.id,
        submittedByUsername: currentUser.username,
        isApproved: true,
        timestamp: new Date().toISOString(),
      };
      
      // Сохранение в БД
      await saveToDatabase("duas", newDua);
      
      // Добавление в историю пользователя
      const newHistoryItem = {
        id: Date.now().toString(),
        duaId: newDua.id,
        duaText: duaText.trim(),
        action: "submitted",
        timestamp: new Date().toISOString(),
        category: category,
      };
      
      const updatedHistory = [...(currentUser.history || []), newHistoryItem];
      await updateInDatabase("users", currentUser.id, { history: updatedHistory });
      
      setCurrentUser(prev => prev ? {...prev, history: updatedHistory} : null);
      
      setDuaText("");
      setCategory("Учёба");
      setScreen("main");
      setMessage("Ваше дуа успешно добавлено!");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Ошибка отправки дуа:", error);
      setMessage("Ошибка при добавлении дуа. Попробуйте еще раз.");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Расчет статистики для текущего пользователя
  const calculateStats = () => {
    if (!currentUser) return { totalDuasMadeForMe: 0, totalDuasIMadeForOthers: 0 };
    
    // Только настоящие дуа, сделанные другими пользователями
    const totalDuasMadeForMe = allDuas
      .filter((dua) => dua.submittedByUserId === currentUser.id)
      .reduce((sum, dua) => sum + dua.count, 0);
      
    const totalDuasIMadeForOthers = (currentUser.history || [])
      .filter((item) => item.action === "done")
      .length;
    
    return { totalDuasMadeForMe, totalDuasIMadeForOthers };
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Получение текущего дуа
  const currentDua = currentDuaId
    ? allDuas.find((dua) => dua.id === currentDuaId)
    : null;
    
  const stats = calculateStats();

  // Проверка прав администратора
  const isAdmin = currentUser && (currentUser.username === "admin" || currentUser.isAdmin);

  // Удаление пользователя (только админ)
  const handleDeleteUser = (username) => {
    if (!isAdmin || !window.confirm(`Вы уверены, что хотите удалить пользователя ${username}?`)) return;
    
    const userToDelete = users.find(u => u.username === username);
    if (!userToDelete) return;
    
    // Удаляем все дуа пользователя
    const updatedDuas = allDuas.filter(dua => dua.submittedByUserId !== userToDelete.id);
    localStorage.setItem("cohesiveUmmaDuas", JSON.stringify(updatedDuas));
    setAllDuas(updatedDuas);
    
    // Удаляем пользователя
    const updatedUsers = users.filter(u => u.username !== username);
    localStorage.setItem("cohesiveUmmaUsers", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    setMessage(`Пользователь ${username} удален`);
    setTimeout(() => setMessage(null), 3000);
  };

  // Назначение администратора (только админ)
  const handleMakeAdmin = (username) => {
    if (!isAdmin) return;
    
    const updatedUsers = users.map(user => 
      user.username === username ? {...user, isAdmin: true} : user
    );
    
    localStorage.setItem("cohesiveUmmaUsers", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    setMessage(`Пользователь ${username} теперь администратор`);
    setTimeout(() => setMessage(null), 3000);
  };

  // Удаление дуа (только админ)
  const handleDeleteDua = (duaId) => {
    if (!isAdmin || !window.confirm("Вы уверены, что хотите удалить это дуа?")) return;
    
    const updatedDuas = allDuas.filter(dua => dua.id !== duaId);
    localStorage.setItem("cohesiveUmmaDuas", JSON.stringify(updatedDuas));
    setAllDuas(updatedDuas);
    
    setMessage("Дуа удалено");
    setTimeout(() => setMessage(null), 3000);
  };

  // Экран загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-spin mb-4">🤲</div>
          <p className="text-xl text-gray-700 font-medium">Загрузка приложения...</p>
          <p className="text-gray-500 mt-2">Подключение к базе данных</p>
        </div>
      </div>
    );
  }

  // Экран восстановления пароля
  if (screen === "recovery") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 flex justify-center">🔒</div>
            <h1 className="text-3xl font-bold text-emerald-800">Восстановление пароля</h1>
            <p className="text-gray-600 mt-2">Введите ваши данные для восстановления</p>
          </div>
          
          {recoverySuccess && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-lg mb-6 text-center">
              {recoverySuccess}
            </div>
          )}
          
          {recoveryError && (
            <div className="bg-rose-100 border border-rose-400 text-rose-800 px-4 py-3 rounded-lg mb-6 text-center">
              {recoveryError}
            </div>
          )}
          
          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Имя пользователя</label>
              <input
                type="text"
                value={recoveryUsername}
                onChange={(e) => setRecoveryUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Кодовое слово</label>
              <input
                type="text"
                value={recoveryWord}
                onChange={(e) => setRecoveryWord(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                minLength="6"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Подтвердите новый пароль</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                minLength="6"
                disabled={isLoading}
              />
            </div>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg text-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Восстановление..." : "Восстановить пароль"}
            </motion.button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setScreen("login")}
              disabled={isLoading}
              className="mt-2 text-emerald-600 font-bold hover:text-emerald-800 transition disabled:opacity-50"
            >
              Назад к входу
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Экран входа
  if (screen === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 flex justify-center">🤲</div>
            <h1 className="text-3xl font-bold text-emerald-800">Cohesive-Umma</h1>
            <p className="text-gray-600 mt-2">Сообщество поддержки через дуа</p>
          </div>
          
          {message && (
            <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-lg mb-6 text-center">
              {message}
            </div>
          )}
          
          {loginError && (
            <div className="bg-rose-100 border border-rose-400 text-rose-800 px-4 py-3 rounded-lg mb-6 text-center">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Имя пользователя</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Пароль</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isLoading}
              />
            </div>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Загрузка..." : "Войти"}
            </motion.button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setScreen("recovery")}
              className="text-emerald-600 font-medium hover:text-emerald-800 transition"
            >
              Забыли пароль?
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">Нет аккаунта?</p>
            <button
              onClick={() => setScreen("signup")}
              disabled={isLoading}
              className="mt-2 text-emerald-600 font-bold hover:text-emerald-800 transition disabled:opacity-50"
            >
              Создать аккаунт
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>Все данные сохраняются в защищенной базе данных</p>
            <p className="mt-1">Ваши дуа полностью анонимны</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Экран регистрации
  if (screen === "signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 flex justify-center">✨</div>
            <h1 className="text-3xl font-bold text-emerald-800">Создать аккаунт</h1>
            <p className="text-gray-600 mt-2">Присоединяйтесь к сообществу</p>
          </div>
          
          {signupError && (
            <div className="bg-rose-100 border border-rose-400 text-rose-800 px-4 py-3 rounded-lg mb-6 text-center">
              {signupError}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Имя пользователя</label>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                autoFocus
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Имя пользователя должно быть уникальным</p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Пароль</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                minLength="6"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Подтвердите пароль</label>
              <input
                type="password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                minLength="6"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Кодовое слово (для восстановления)</label>
              <input
                type="text"
                value={signupRecoveryWord}
                onChange={(e) => setSignupRecoveryWord(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Запомните это слово для восстановления пароля</p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Подтвердите кодовое слово</label>
              <input
                type="text"
                value={signupConfirmRecoveryWord}
                onChange={(e) => setSignupConfirmRecoveryWord(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isLoading}
              />
            </div>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg text-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Создание аккаунта..." : "Создать аккаунт"}
            </motion.button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">Уже есть аккаунт?</p>
            <button
              onClick={() => setScreen("login")}
              disabled={isLoading}
              className="mt-2 text-emerald-600 font-bold hover:text-emerald-800 transition disabled:opacity-50"
            >
              Войти
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Админ-панель
  if (screen === "admin") {
    if (!isAdmin) {
      setScreen("main");
      return null;
    }
    
    const totalUsers = users.length;
    const totalDuas = allDuas.length;
    const totalCompleted = allDuas.reduce((sum, dua) => sum + dua.count, 0);
    const totalComplaints = complaints.length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col">
        <header className="bg-white/90 backdrop-blur-sm shadow-md p-4 text-center sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setScreen("main")}
              className="text-emerald-700 font-bold flex items-center"
            >
              <span className="mr-1">←</span> Назад
            </button>
            <h1 className="text-2xl font-bold text-emerald-800">Админ-панель</h1>
            <div className="w-8"></div>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl mb-6 w-full text-center shadow-md"
            >
              {message}
            </motion.div>
          )}
          
          {/* Navigation tabs */}
          <div className="flex space-x-2 mb-6 border-b border-gray-200">
            {["stats", "users", "duas", "complaints"].map((tab) => (
              <button
                key={tab}
                onClick={() => setAdminScreen(tab)}
                className={`px-4 py-2 font-medium rounded-t-lg ${
                  adminScreen === tab
                    ? "text-emerald-700 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                {tab === "stats" && "Статистика"}
                {tab === "users" && "Пользователи"}
                {tab === "duas" && "Дуа"}
                {tab === "complaints" && "Жалобы"}
              </button>
            ))}
          </div>
          
          {/* Statistics */}
          {adminScreen === "stats" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow p-4 text-center border border-emerald-100">
                <div className="text-3xl font-bold text-emerald-700 mb-2">{totalUsers}</div>
                <div className="text-gray-600">Всего пользователей</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center border border-amber-100">
                <div className="text-3xl font-bold text-amber-600 mb-2">{totalDuas}</div>
                <div className="text-gray-600">Всего дуа</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalCompleted}</div>
                <div className="text-gray-600">Выполнено дуа</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center border border-rose-100">
                <div className="text-3xl font-bold text-rose-600 mb-2">{totalComplaints}</div>
                <div className="text-gray-600">Жалоб</div>
              </div>
            </div>
          )}
          
          {/* Users management */}
          {adminScreen === "users" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100 font-bold text-gray-700">
                Управление пользователями
              </div>
              <div className="max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">
                        {user.isAdmin ? "Администратор" : "Пользователь"}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!user.isAdmin && user.username !== "admin" && (
                        <button
                          onClick={() => handleMakeAdmin(user.username)}
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Сделать админом
                        </button>
                      )}
                      {user.username !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(user.username)}
                          className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded hover:bg-rose-200"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Duas management */}
          {adminScreen === "duas" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100 font-bold text-gray-700">
                Управление дуа
              </div>
              <div className="max-h-96 overflow-y-auto">
                {allDuas.map((dua) => (
                  <div key={dua.id} className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">"{dua.text}"</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Категория: {dua.category} | Сделано: {dua.count} раз
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Отправлено: {dua.submittedByUsername}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDua(dua.id)}
                        className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded hover:bg-rose-200 flex-shrink-0"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Complaints */}
          {adminScreen === "complaints" && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100 font-bold text-gray-700">
                Все жалобы ({complaints.length})
              </div>
              <div className="max-h-96 overflow-y-auto">
                {complaints.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Нет жалоб
                  </div>
                ) : (
                  complaints.map((complaint) => (
                    <div key={complaint.id} className="p-4 border-b border-gray-100">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium text-gray-800">"{complaint.duaText}"</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Отправлено: {complaint.submittedByUsername}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-rose-600">
                            {complaint.reportedBy}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(complaint.timestamp).toLocaleString("ru-RU")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Главный экран
  if (screen === "main") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col">
        {/* Шапка */}
        <header className="bg-white/90 backdrop-blur-sm shadow-md p-4 text-center sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-emerald-800 flex items-center">
              <span className="mr-2">🤲</span>
              Cohesive-Umma
            </h1>
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <button
                  onClick={() => setScreen("admin")}
                  className="bg-purple-100 text-purple-800 text-sm font-medium py-1 px-3 rounded-full hover:bg-purple-200 transition flex items-center"
                >
                  <span className="mr-1">⚙️</span> Админ
                </button>
              )}
              {notificationPermission !== "granted" && (
                <button
                  onClick={() => {
                    requestNotificationPermission();
                    setMessage("Разрешение на уведомления запрошено");
                    setTimeout(() => setMessage(null), 3000);
                  }}
                  className="bg-amber-100 text-amber-800 text-sm font-medium py-1 px-3 rounded-full hover:bg-amber-200 transition flex items-center"
                >
                  🔔 Включить уведомления
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-rose-100 text-rose-700 text-sm font-medium py-1 px-3 rounded-full hover:bg-rose-200 transition flex items-center"
              >
                <span className="mr-1">🚪</span> Выйти
              </button>
            </div>
          </div>
          {showReminder && (
            <div className="mt-2 bg-amber-100 text-amber-800 text-sm py-1 px-3 rounded-full inline-block animate-pulse">
              ⏰ Напоминание: Пора сделать дуа для других!
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col items-center p-4 overflow-y-auto">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl mb-6 w-full max-w-md text-center shadow-md"
            >
              {message}
            </motion.div>
          )}

          {currentDua ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mb-6 border border-emerald-100"
            >
              <div className="flex items-start">
                <div className="bg-emerald-100 text-emerald-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  {currentDua.category.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Дуа от другого пользователя:
                  </h2>
                  <p className="text-gray-700 text-lg italic leading-relaxed">
                    "{currentDua.text}"
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-between items-center">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
                  {currentDua.category}
                </span>
                <div className="flex items-center">
                  <span className="text-amber-500 mr-1">★</span>
                  <span className="text-sm font-medium text-gray-600">
                    {currentDua.count} раз
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mb-6 text-center">
              <div className="text-4xl mb-4">🕊️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Нет доступных дуа</h3>
              <p className="text-gray-600 mb-4">Пока никто не добавил дуа. Станьте первым!</p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setScreen("submit")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl transition duration-200"
              >
                Добавить дуа
              </motion.button>
            </div>
          )}

          {currentHadith && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mb-8 border border-amber-100"
            >
              <div className="flex items-start">
                <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                  {currentHadith.source.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Хадис или аят о дуа:
                  </h2>
                  <p className="text-gray-700 italic leading-relaxed mb-2">
                    "{currentHadith.text}"
                  </p>
                  <p className="text-sm text-amber-700 font-medium">
                    — {currentHadith.source}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentDua && (
            <div className="flex space-x-4 mt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-xl transition duration-200 flex flex-col items-center shadow-md flex-1"
              >
                <span className="text-xl mb-1">➡️</span>
                <span className="text-sm">Пропустить</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReport}
                className="bg-amber-400 hover:bg-amber-500 text-white font-bold py-4 px-6 rounded-xl transition duration-200 flex flex-col items-center shadow-md flex-1"
              >
                <span className="text-xl mb-1">⚠️</span>
                <span className="text-sm">Жалоба</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDone}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition duration-200 flex flex-col items-center shadow-lg flex-1 transform hover:scale-105"
              >
                <span className="text-xl mb-1">✅</span>
                <span className="text-sm">Сделано</span>
              </motion.button>
            </div>
          )}
          
          <div className="mt-8 text-center text-sm text-gray-500 max-w-md">
            <p>Все дуа добавлены реальными пользователями приложения</p>
            <p className="mt-1">Ваши данные полностью защищены и анонимны</p>
          </div>
        </div>

        {/* Нижняя навигация */}
        <nav className="bg-white/90 backdrop-blur-sm shadow-t p-4 border-t border-gray-100">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setScreen("main")}
              className={`flex flex-col items-center p-2 rounded-xl transition ${
                screen === "main"
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-gray-500 hover:text-emerald-500"
              }`}
            >
              <span className="text-2xl mb-1">🏠</span>
              <span className="text-sm font-medium">Главная</span>
            </button>
            <button
              onClick={() => setScreen("submit")}
              className="flex flex-col items-center bg-emerald-500 text-white rounded-xl w-16 h-16 -mt-8 shadow-xl border-4 border-white hover:scale-105 transition-transform"
            >
              <span className="text-4xl font-bold mt-1">+</span>
              <span className="text-xs mt-1">Добавить дуа</span>
            </button>
            <button
              onClick={() => setScreen("profile")}
              className={`flex flex-col items-center p-2 rounded-xl transition ${
                screen === "profile"
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-gray-500 hover:text-emerald-500"
              }`}
            >
              <span className="text-2xl mb-1">👤</span>
              <span className="text-sm font-medium">Профиль</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  // Экран добавления дуа
  if (screen === "submit") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col">
        <header className="bg-white/90 backdrop-blur-sm shadow-md p-4 text-center sticky top-0 z-10">
          <button
            onClick={() => setScreen("main")}
            className="absolute left-4 top-4 text-emerald-700 font-bold flex items-center"
          >
            <span className="mr-1">←</span> Назад
          </button>
          <h1 className="text-2xl font-bold text-emerald-800">Новое дуа</h1>
        </header>

        <div className="flex-1 flex flex-col items-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Поделитесь своим дуа
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Ваши дуа будут анонимны и промодерированы перед публикацией
            </p>

            <form onSubmit={handleSubmitDua} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Текст дуа
                </label>
                <textarea
                  value={duaText}
                  onChange={(e) => setDuaText(e.target.value)}
                  placeholder="Напишите ваше дуа здесь..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Категория
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  disabled={isSubmitting}
                >
                  <option>Учёба</option>
                  <option>Здоровье</option>
                  <option>Семья</option>
                  <option>Работа</option>
                  <option>Личностный рост</option>
                  <option>Другое</option>
                </select>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Отправка..." : "Отправить дуа"}
              </motion.button>
            </form>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <span className="bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
                !
              </span>
              Важно знать
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex">
                <span className="text-emerald-500 mr-2 text-lg">✓</span>
                <span>Все дуа проходят модерацию перед публикацией</span>
              </li>
              <li className="flex">
                <span className="text-emerald-500 mr-2 text-lg">✓</span>
                <span>Ваши данные полностью анонимны</span>
              </li>
              <li className="flex">
                <span className="text-emerald-500 mr-2 text-lg">✓</span>
                <span>Вы получите уведомление, когда кто-то сделает дуа за вас</span>
              </li>
              <li className="flex">
                <span className="text-emerald-500 mr-2 text-lg">✓</span>
                <span>Все дуа сохраняются в защищенной базе данных</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Экран профиля
  if (screen === "profile") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col">
        <header className="bg-white/90 backdrop-blur-sm shadow-md p-4 text-center sticky top-0 z-10">
          <button
            onClick={() => setScreen("main")}
            className="absolute left-4 top-4 text-emerald-700 font-bold flex items-center"
          >
            <span className="mr-1">←</span> Назад
          </button>
          <h1 className="text-2xl font-bold text-emerald-800">Мой профиль</h1>
          <p className="text-gray-600 mt-1">@{currentUser?.username}</p>
          {isAdmin && (
            <button
              onClick={() => setScreen("admin")}
              className="mt-2 bg-purple-100 text-purple-800 text-sm font-medium py-1 px-3 rounded-full hover:bg-purple-200 transition inline-flex items-center"
            >
              <span className="mr-1">⚙️</span> Админ-панель
            </button>
          )}
        </header>

        <div className="flex-1 flex flex-col items-center p-4 overflow-y-auto">
          {/* Карточки статистики */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-5 text-center border border-emerald-100"
            >
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤲</span>
              </div>
              <h3 className="text-gray-600 font-medium mb-1">
                Сделали дуа за вас
              </h3>
              <p className="text-3xl font-bold text-emerald-700">
                {stats.totalDuasMadeForMe}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-5 text-center border border-amber-100"
            >
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-gray-600 font-medium mb-1">
                Вы сделали дуа
              </h3>
              <p className="text-3xl font-bold text-amber-600">
                {stats.totalDuasIMadeForOthers}
              </p>
            </motion.div>
          </div>

          {/* Визуализация */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mb-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Ваши добрые дела
            </h3>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-2xl">🌱</span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, stats.totalDuasMadeForMe * 5)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Люди сделали дуа за вас: {stats.totalDuasMadeForMe} раз
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-2xl">💫</span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, stats.totalDuasIMadeForOthers * 5)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Вы сделали дуа для других: {stats.totalDuasIMadeForOthers} раз
                </p>
              </div>
            </div>
          </motion.div>

          {/* История */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              История дуа
            </h3>
            {currentUser?.history?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🕊️</div>
                <p>История пуста</p>
                <p className="text-sm mt-1">Начните делать дуа для других</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {currentUser?.history
                  ?.slice()
                  .reverse()
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border-l-4 ${
                        item.action === "done"
                          ? "border-emerald-500 bg-emerald-50"
                          : item.action === "skip"
                          ? "border-amber-500 bg-amber-50"
                          : "border-blue-500 bg-blue-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.action === "done"
                              ? "Сделано дуа"
                              : item.action === "skip"
                              ? "Пропущено дуа"
                              : "Отправлено дуа"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            "{item.duaText}"
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                item.action === "done"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.action === "skip"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
          
          <div className="mt-6 text-center text-sm text-gray-500 max-w-md pb-6">
            <p>Все ваши действия сохраняются в защищенной базе данных</p>
            <p className="mt-1">Данные синхронизируются в реальном времени</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Initial users data (demo accounts) with recovery words and admin flag
const initialUsers = [
  {
    id: "admin",
    username: "admin",
    password: "admin",
    recoveryWord: "admin",
    isAdmin: true,
    history: [],
    createdAt: new Date("2026-01-15").toISOString(),
  },
  {
    id: "user1",
    username: "Али",
    password: "password123",
    recoveryWord: "семья",
    isAdmin: false,
    history: [],
    createdAt: new Date("2026-01-15").toISOString(),
  },
  {
    id: "user2",
    username: "Фатима",
    password: "securepass",
    recoveryWord: "вера",
    isAdmin: false,
    history: [],
    createdAt: new Date("2026-01-20").toISOString(),
  },
  {
    id: "user3",
    username: "Ибрагим",
    password: "ibrahim2026",
    recoveryWord: "здоровье",
    isAdmin: false,
    history: [],
    createdAt: new Date("2026-01-25").toISOString(),
  },
];

// Initial du'as data (submitted by demo users)
const initialDuas = [
  {
    id: "1",
    text: "О Аллах, даруй мне терпение в трудные времена и благослови мою семью здоровьем и благополучием.",
    category: "Семья",
    count: 12,
    submittedByUserId: "user1",
    submittedByUsername: "Али",
    isApproved: true,
    timestamp: new Date("2026-01-28").toISOString(),
  },
  {
    id: "2",
    text: "Господи, помоги мне успешно сдать экзамены и обрести знания, которые принесут пользу людям.",
    category: "Учёба",
    count: 8,
    submittedByUserId: "user2",
    submittedByUsername: "Фатима",
    isApproved: true,
    timestamp: new Date("2026-01-29").toISOString(),
  },
  {
    id: "3",
    text: "О Всемилостивый, исцели мою бабушку от болезни и даруй ей долгие годы жизни в радости.",
    category: "Здоровье",
    count: 15,
    submittedByUserId: "user3",
    submittedByUsername: "Ибрагим",
    isApproved: true,
    timestamp: new Date("2026-01-30").toISOString(),
  },
  {
    id: "4",
    text: "Аллах, помоги мне найти работу, которая будет приносить пользу обществу и достаток моей семье.",
    category: "Работа",
    count: 7,
    submittedByUserId: "user1",
    submittedByUsername: "Али",
    isApproved: true,
    timestamp: new Date("2026-01-30").toISOString(),
  },
];

// ReactDOM render
ReactDOM.createRoot(document.getElementById("root")).render(<App />);