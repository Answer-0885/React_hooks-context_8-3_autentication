import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import axios from "axios";
import { Form } from "./components/Form";
import { CardNews } from "./components/CardNews";
import { FormReg } from "./components/FormReg";
import { FormAuthUser } from "./components/FormAuthUser";
import usePolling from "./hooks/usePolling";

const App = () => {
  const [dataValue, setDataValue] = useState({}); //Получаем данные с инпут формы login
  const [dataReg, setDataReg] = useState({}); // Получаем данные с инпут формы регистрации
  const [isRegistr, setIsRegistr] = useState(false); // Определяем вызов формы регистрации через кнопку "Регистрация"
  const [isAuth, setIsAuth] = useState(false); //Определяем состояние, авторизован ли юзер
  const [userAuth, setUserAuth] = useState(null); // хранятся данные из бека авторизованного юзера
  //const [news, setNews] = useState(null); // Новости

  const [{ news }] = usePolling(process.env.REACT_APP_NEWS_URL); //кастомный хук вывода новостей на страницу

  const formReg = useRef(); // форма регистрации

  /*Прослушиваем событие клика вне формы регистрации*/
  useEffect(() => {
    document.addEventListener("click", (e) => handleClick(e), true);
    return () => {
      document.removeEventListener("click", (e) => handleClick(e), true);
    };
  }, [isRegistr]);

  //Закрываем форму регистрации при клике вне формы
  const handleClick = (e) => {
    formReg.current &&
      isRegistr &&
      e.target.parentElement !== formReg.current &&
      setIsRegistr(false);
  };

  //Обновляем страницу и проверяем на наличие токена

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/privat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(({ data }) => {
        hasAuth(data);
        console.log(data.id);
      })
      .catch((e) => {
        handleLogout();
        console.log("error:", e);
      });
  }, []);

  // Получаем данные с инпутов формы login
  const handleChange = ({ target: { value, name } }) =>
    setDataValue({ ...dataValue, [name]: value });

  // Отправляем данные юзера с формы регистрации
  const handleRegistration = (e) => {
    e.preventDefault();
    axios
      .post("/registration", dataReg)
      .catch(() => alert("Такой пользователь уже зарегестрирован"));
    setIsRegistr(false);
  };

  //Получаем данные с инпут формы регистрации
  const handleValueReg = ({ target: { value, name } }) =>
    setDataReg({ ...dataReg, [name]: value });

  //Вызываем форму регистрации
  const onRegistr = () => setIsRegistr(true);

  //Отправляем данные юзера на авторизацию
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("/auth", dataValue)
      .then(({ data }) => {
        if (data.id) {
          hasAuth(data);
          localStorage.setItem("token", JSON.stringify(data.token));
        }
      })
      .catch(() => alert("Не правильно введен логин или пароль"));
  };

  //Устанавливаем что юзер авторизовался
  const hasAuth = (user) => {
    setIsAuth(true);
    setUserAuth(user);
  };
  //Юзер выходит из авторизации
  const handleLogout = () => {
    setIsAuth(false);
    localStorage.removeItem("token");
  };

  return (
    <>
      <div className="container">
        <div className="header">
          <div className="logo">Neto Social</div>
          {isRegistr && (
            <FormReg
              handleRegistration={handleRegistration}
              handleValueReg={handleValueReg}
              formReg={formReg}
            />
          )}
          {isAuth ? (
            <FormAuthUser userAuth={userAuth} handleLogout={handleLogout} />
          ) : (
            !isRegistr && (
              <Form
                onRegistr={onRegistr}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
              />
            )
          )}
        </div>

        <div className="container-content">
          {!isAuth ? (
            <div className="title-page">
              <i className="title-content">Neto Social</i>
              <i className="content">Facebook and VK killer</i>
            </div>
          ) : (
            news?.map(({ title, urlToImage, description, url }) => (
              <CardNews
                key={title}
                description={description}
                title={title}
                url={url}
                urlToImage={urlToImage}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default App;