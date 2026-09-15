const modal = document.getElementById("modal");

const SUPABASE_URL = "https://lzmibbwrcixusnmechhd.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_47OTPho0Qw5mfrl69TJ7Cg_h9Z_7NMy";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* LOGIN */

const loginTela = document.getElementById("loginTela");
const emailLogin = document.getElementById("emailLogin");
const senhaLogin = document.getElementById("senhaLogin");
const entrarBtn = document.getElementById("entrarBtn");
const mensagemLogin = document.getElementById("mensagemLogin");


entrarBtn.addEventListener("click", async () => {

    const email = emailLogin.value.trim();
    const senha = senhaLogin.value;

    mensagemLogin.textContent = "";

    if (email === "" || senha === "") {

        mensagemLogin.textContent =
            "Preencha o e-mail e a senha.";

        return;
    }


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });


    if (error) {

        mensagemLogin.textContent =
            "E-mail ou senha incorretos.";

        return;
    }


    loginTela.style.display = "none";

});

const novoPostBtn = document.getElementById("novoPostBtn");
const fecharModal = document.getElementById("fecharModal");
const salvarPost = document.getElementById("salvarPost");

const tituloInput = document.getElementById("tituloInput");
const descricaoInput = document.getElementById("descricaoInput");
const dataInput = document.getElementById("dataInput");
const semanaInput = document.getElementById("semanaInput");
const statusInput = document.getElementById("statusInput");

const cronograma = document.getElementById("cronograma");

let postEditando = null;


/* ABRIR MODAL */

novoPostBtn.addEventListener("click", () => {

    postEditando = null;

    document.getElementById("modalTitulo").textContent = "Novo Post";

    tituloInput.value = "";
    descricaoInput.value = "";
    dataInput.value = "";
    semanaInput.value = "1";
    statusInput.value = "planejado";

    modal.classList.add("ativo");

});


/* FECHAR MODAL */

fecharModal.addEventListener("click", () => {
    modal.classList.remove("ativo");
});


/* CLICAR FORA DO MODAL */

modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        modal.classList.remove("ativo");
    }

});


/* SALVAR POST */

salvarPost.addEventListener("click", () => {

    const titulo = tituloInput.value.trim();
    const descricao = descricaoInput.value.trim();
    const data = dataInput.value;

    if (titulo === "") {
        alert("Digite o título do post.");
        return;
    }

    if (data === "") {
        alert("Escolha a data de publicação.");
        return;
    }


    /* EDITAR */

    if (postEditando) {

        postEditando.querySelector("h3").textContent =
            "📱 " + titulo;

        postEditando.querySelector(".post p").textContent =
            descricao;

        postEditando.querySelector(".post-info span").textContent =
            "📅 " + formatarData(data);

        atualizarStatus(
            postEditando,
            statusInput.value
        );

        modal.classList.remove("ativo");

        salvarDados();

        return;
    }


    /* NOVO POST */

    const semanaNumero = semanaInput.value;

    let semana = document.querySelector(
        `.semana:nth-child(${semanaNumero})`
    );


    /*
       Caso a semana ainda não exista,
       criamos uma nova.
    */

    if (!semana) {

        semana = criarSemana(semanaNumero);

    }


    const posts = semana.querySelector(".posts");

    if (posts.children.length >= 3) {

        alert("Essa semana já possui 3 posts.");

        return;
    }


    const post = document.createElement("div");

    post.className = "post " + statusInput.value;

    post.innerHTML = `

        <div class="post-topo">

            <span class="numero">
                POST ${posts.children.length + 1}
            </span>

            <span class="status">
                ${nomeStatus(statusInput.value)}
            </span>

        </div>

        <h3>📱 ${titulo}</h3>

        <p>${descricao}</p>

        <div class="post-info">

            <span>
                📅 ${formatarData(data)}
            </span>

        </div>

        <div class="acoes">

            <button class="publicar">
                ✓ Publicar
            </button>

            <button class="editar">
                ✏️ Editar
            </button>

            <button class="excluir">
                🗑️ Excluir
            </button>

        </div>
    `;


    posts.appendChild(post);

    configurarBotoes(post);

    modal.classList.remove("ativo");

    salvarDados();

});


/* CONFIGURAR BOTÕES */

function configurarBotoes(post) {

    const publicar =
        post.querySelector(".publicar");

    const editar =
        post.querySelector(".editar");

    const excluir =
        post.querySelector(".excluir");


    publicar.addEventListener("click", () => {

        atualizarStatus(post, "publicado");

        salvarDados();

    });


    editar.addEventListener("click", () => {

        postEditando = post;

        document.getElementById("modalTitulo")
            .textContent = "Editar Post";

        tituloInput.value =
            post.querySelector("h3")
                .textContent
                .replace("📱 ", "");

        descricaoInput.value =
            post.querySelector("p").textContent;

        statusInput.value =
            post.classList.contains("publicado")
                ? "publicado"
                : "planejado";

        modal.classList.add("ativo");

    });


    excluir.addEventListener("click", () => {

        const confirmar =
            confirm("Deseja excluir este post?");

        if (confirmar) {

            post.remove();

            salvarDados();

        }

    });

}


/* ALTERAR STATUS */

function atualizarStatus(post, status) {

    post.classList.remove(
        "planejado",
        "producao",
        "publicado"
    );

    post.classList.add(status);

    post.querySelector(".status").textContent =
        nomeStatus(status);

}


/* NOME DO STATUS */

function nomeStatus(status) {

    if (status === "planejado")
        return "Planejado";

    if (status === "producao")
        return "Em produção";

    if (status === "publicado")
        return "Publicado";

}


/* FORMATAR DATA */

function formatarData(data) {

    const partes = data.split("-");

    const ano = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    const dataObj = new Date(ano, mes, dia);

    const diasSemana = [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado"
    ];

    const diaSemana = diasSemana[dataObj.getDay()];

    return `${partes[2]}/${partes[1]}/${partes[0]} — ${diaSemana}`;

}


/* CRIAR SEMANA */

function criarSemana(numero) {

    const semana = document.createElement("div");

    semana.className = "semana";

    semana.innerHTML = `

        <div class="semana-header">

            <div>

                <h2>Semana ${numero}</h2>

                <span>
                    Cronograma
                </span>

            </div>

        </div>

        <div class="posts"></div>
    `;

    cronograma.appendChild(semana);

    return semana;

}


/* CONFIGURAR POSTS EXISTENTES */

document.querySelectorAll(".post")
    .forEach(post => {

        configurarBotoes(post);

    });


/* SALVAR NO NAVEGADOR */

function salvarDados() {

    localStorage.setItem(
        "cronograma",
        cronograma.innerHTML
    );

}


/* CARREGAR DADOS */

function carregarDados() {

    const dados =
        localStorage.getItem("cronograma");

    if (dados) {

        cronograma.innerHTML = dados;

        document.querySelectorAll(".post")
            .forEach(post => {

                configurarBotoes(post);

            });

    }

}


carregarDados();