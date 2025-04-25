<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Connexion</title>

  <!-- Police Carter One -->
  <link href="https://fonts.googleapis.com/css2?family=Carter+One&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&display=swap" rel="stylesheet">



  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      height: 100vh;
     /* background-image: url('${url.resourcesPath}/images/z1.png');*/
      background-size: cover;
      background-position: center;
      font-family: 'Poppins', Medium;
      display: flex;
      flex-direction: column;
      align-items: center;
      background :   radial-gradient(circle, #432982, #271f4d);
    }

  



    /* Logo animé en haut */
    .logo-container {
      position: absolute;
      top: 20px;
      left: 20px;
      animation: bounce 2s infinite;
    }

    .logo-container img {
      width: 150px;
      height: auto;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* Conteneur du formulaire */
    .container {
      margin-top: 130px;
      width: 400px;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      text-align: center;
      color: white;
      background :   radial-gradient(circle , #432982, #271f4d);
    }

    h1 {
      font-size: 30px;
      color: white;
      margin-bottom: 20px;
      color :  #fffff;
      font-family: 'Bubblegum Sans', sans-serif;
    }

    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 25px;
      margin-bottom: 15px;
      background-color: rgba(255,255,255,0.2);
      color: white;
      font-size: 16px;
    }

    input::placeholder {
      color: #ccc;
    }

    button {
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 25px;
      background: linear-gradient(to top, #f298bc, #b01e58);
      color: white;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
      font-family: 'Poppins', Medium;
    }

    .signup {
      margin-top: 15px;
      font-size: 14px;
    }

    .signup a {
      color: #fff;
      font-weight: bold;
      text-decoration: none;
    }
  </style>
</head>

<body>
  <!-- Logo animé -->
  <div class="logo-container">
<img src='${url.resourcesPath}/images/Logo-JoueTonAvenir.png' alt="Logo" width="100px" height="100px">



  </div>

  <!-- Formulaire de connexion -->
  <div class="container">
    <h1>Connexion</h1>
    <form action="${url.loginAction}" method="post">
      <input type="text" name="username" placeholder="Adresse email" />
      <input type="password" name="password" placeholder="Mot de passe" />
      <button type="submit">Se connecter</button>
    </form>
    <div class="signup">
      Vous n'avez pas de compte ?  
<a 
href="/realms/LFM/login-actions/registration">Créer un compte</a> 
    </div>
  </div>
</body>
</html>
