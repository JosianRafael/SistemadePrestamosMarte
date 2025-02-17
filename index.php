<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="min-h-screen">
    <div class="grid min-h-screen lg:grid-cols-2">
        <div class="flex flex-col gap-4 p-6 md:p-10">
            <div class="flex justify-center gap-2 md:justify-start">
                <a class="flex items-center gap-2 font-medium">
                    <div class="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4">
                            <path d="M12 1v22M15 5c1.5 1.5 1.5 4 0 5s-4 1.5-5 0-1.5-4 0-5 4-1.5 5 0zM15 19c1.5-1.5 1.5-4 0-5s-4-1.5-5 0-1.5 4 0 5 4 1.5 5 0z"/>
                            <path d="M8 9h8M8 15h8"/>
                        </svg>
                    </div>
                    Inversiones P&P Marte 
                </a>
            </div>
            <div class="flex flex-1 items-center justify-center">
                <div class="w-full max-w-xs">
                    <form id="loginForm" class="flex flex-col gap-6">
                        <div class="flex flex-col items-center gap-2 text-center">
                            <h1 class="text-2xl font-bold">Sistema de Prestamos</h1>
                            <p class="text-balance text-sm text-gray-500">
                                Ingrese sus datos para acceder al sistema
                            </p>
                        </div>
                        <div class="grid gap-6">
                            <div class="grid gap-2">
                                <label for="name" class="text-sm font-medium">Nombre</label>
                                <input id="name" name="usuario" type="text" placeholder="Escribe tu nombre" required class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                            </div>
                            <div class="grid gap-2">
                                <div class="flex items-center">
                                    <label for="password" class="text-sm font-medium">Contraseña</label>
                                </div>
                                <input id="password" name="password" type="password" placeholder="Escribe tu Contraseña" required class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                            </div>
                            <button type="submit" class="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                Ingresar
                            </button>
                            <div id="error-message" class="text-red-500 text-sm text-center hidden"></div>
                        </div>
                        <button type="button" class="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50">
                                Inversiones P&P Marte System
                            </button>
                        <div class="text-center text-sm">
                            By: Josian Viñas & Felix Mendoza
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="relative hidden bg-gradient-to-r from-gray-200 to-gray-100 lg:block border-l-[1px] border-black shadow-lg">
    <img
        src="https://img.freepik.com/vector-premium/logotipo-icono-prestamo-hipotecario_586739-6080.jpg"
        alt="Image"
        class="absolute inset-0 h-full w-full object-cover"
    />
</div>


    </div>

    <script>
        document.getElementById("loginForm").addEventListener("submit", function(event) {
            event.preventDefault();
            
            let formData = new FormData(this);
            let errorMessage = document.getElementById("error-message");

            fetch("Modules/loginModulo.php", {
                method: "POST",
                body: formData
            })
            .then(response => response.text())
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch (error) {
                    console.error("Error de JSON:", text);
                    throw new Error("Respuesta inválida del servidor");
                }
            })
            .then(data => {
                if (data.success) {
                    window.location.href = "index.html";
                } else {
                    errorMessage.textContent = data.error;
                    errorMessage.classList.remove("hidden");
                }
            })
            .catch(error => {
                console.error("Error en fetch:", error);
                errorMessage.textContent = "Error en la conexión con el servidor.";
                errorMessage.classList.remove("hidden");
            });
        });
    </script>
</body>
</html>
