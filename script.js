const modal = document.getElementById("modal");

/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://lzmibbwrcixusnmechhd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_47OTPho0Qw5mfrl69TJ7Cg_h9Z_7NMy";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* =====================================================
   ELEMENTOS DO LOGIN
===================================================== */

const loginTela =
    document.getElementById("loginTela");

const emailLogin =
    document.getElementById("emailLogin");

const senhaLogin =
    document.getElementById("senhaLogin");

const entrarBtn =
    document.getElementById("entrarBtn");

const mensagemLogin =
    document.getElementById("mensagemLogin");

const sairBtn =
    document.getElementById("sairBtn");

const adminBtn =
    document.getElementById("adminBtn");

let usuarioLogado = null;

/* =====================================================
   ELEMENTOS DO CRONOGRAMA
===================================================== */

const novoPostBtn =
    document.getElementById("novoPostBtn");

const fecharModal =
    document.getElementById("fecharModal");

const salvarPost =
    document.getElementById("salvarPost");

const tituloInput =
    document.getElementById("tituloInput");

const descricaoInput =
    document.getElementById("descricaoInput");

const dataInput =
    document.getElementById("dataInput");

const semanaInput =
    document.getElementById("semanaInput");

const statusInput =
    document.getElementById("statusInput");

const cronograma =
    document.getElementById("cronograma");

let postEditando = null;

adminBtn.addEventListener(
    "click",
    () => {

        loginTela.style.display = "flex";

        mensagemLogin.textContent = "";

        emailLogin.value = "";
        senhaLogin.value = "";

        emailLogin.focus();
    }
);

function atualizarPermissoes(usuario) {

    usuarioLogado = usuario;

    if (usuario) {

        loginTela.style.display = "none";

        novoPostBtn.style.display =
            "inline-block";

        sairBtn.style.display =
            "inline-block";

        adminBtn.style.display =
            "none";

    } else {

        loginTela.style.display = "none";

        novoPostBtn.style.display =
            "none";

        sairBtn.style.display =
            "none";

        adminBtn.style.display =
            "inline-block";
    }

    document.querySelectorAll(
        ".publicar, .editar, .excluir"
    ).forEach(botao => {

        botao.style.display =
            usuario
                ? "inline-block"
                : "none";
    });
}

/* =====================================================
   VERIFICAR SESSÃO
===================================================== */

async function verificarSessao() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

        atualizarPermissoes(null);

        return;
    }

    if (data.session) {

        atualizarPermissoes(
            data.session.user
        );

    } else {

        atualizarPermissoes(null);
    }
}

/* =====================================================
   LOGIN
===================================================== */

entrarBtn.addEventListener(
    "click",
    async () => {

        const email =
            emailLogin.value.trim();

        const senha =
            senhaLogin.value;

        mensagemLogin.textContent = "";

        if (
            email === "" ||
            senha === ""
        ) {

            mensagemLogin.textContent =
                "Preencha o e-mail e a senha.";

            return;
        }

        entrarBtn.disabled = true;

        entrarBtn.textContent =
            "Entrando...";

        const { data, error } =
            await supabaseClient.auth
                .signInWithPassword({
                    email: email,
                    password: senha
                });

        entrarBtn.disabled = false;

        entrarBtn.textContent =
            "Entrar";

        if (error) {

            console.error(
                "Erro no login:",
                error
            );

            mensagemLogin.textContent =
                "E-mail ou senha incorretos.";

            return;
        }

        mensagemLogin.textContent = "";

        atualizarPermissoes(
            data.user
        );

        await carregarPosts();
    }
);

/* =====================================================
   SAIR
===================================================== */

sairBtn.addEventListener(
    "click",
    async () => {

        sairBtn.disabled = true;

        sairBtn.textContent =
            "Saindo...";

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {

            console.error(
                "Erro ao sair:",
                error
            );

            sairBtn.disabled = false;

            sairBtn.textContent =
                "🚪 Sair";

            return;
        }

        sairBtn.disabled = false;

        sairBtn.textContent =
            "🚪 Sair";

        atualizarPermissoes(null);
    }
);

/* =====================================================
   OBSERVAR LOGIN
===================================================== */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (session) {

            atualizarPermissoes(
                session.user
            );

        } else {

            atualizarPermissoes(null);
        }
    }
);

/* =====================================================
   CARREGAR POSTS DO SUPABASE
===================================================== */

async function carregarPosts() {

    const { data, error } =
        await supabaseClient
            .from("posts")
            .select("*")
            .order("semana", {
                ascending: true
            })
            .order("ordem", {
                ascending: true
            })
            .order("data_publicacao", {
                ascending: true
            });

    if (error) {

        console.error(
            "Erro ao carregar posts:",
            error
        );

        alert(
            "Não foi possível carregar os posts."
        );

        return;
    }

    renderizarPosts(data);
}

/* =====================================================
   RENDERIZAR POSTS
===================================================== */

function renderizarPosts(posts) {

    cronograma.innerHTML = "";

    /* Criar as 6 semanas */

    for (let i = 1; i <= 6; i++) {

        criarSemana(i);
    }

    /* Colocar os posts nas semanas */

    posts.forEach(post => {

        const semana =
            document.querySelector(
                `.semana[data-semana="${post.semana}"]`
            );

        if (!semana) {
            return;
        }

        const container =
            semana.querySelector(".posts");

        const elemento =
            criarPostElemento(post);

        container.appendChild(elemento);
    });

    /* Configurar botões */

    document.querySelectorAll(
        ".post"
    ).forEach(post => {

        configurarBotoes(post);
    });

    atualizarPermissoes(
        usuarioLogado
    );
}

/* =====================================================
   CRIAR SEMANA
===================================================== */

function criarSemana(numero) {

    const semana =
        document.createElement("div");

    semana.className =
        "semana";

    semana.dataset.semana =
        numero;

    semana.innerHTML = `
        <div class="semana-header">
            <div>
                <h2>Semana ${numero}</h2>
                <span>Cronograma</span>
            </div>
        </div>

        <div class="posts"></div>
    `;

    cronograma.appendChild(
        semana
    );

    return semana;
}

/* =====================================================
   CRIAR ELEMENTO DO POST
===================================================== */

function criarPostElemento(post) {

    const elemento =
        document.createElement("div");

    elemento.className =
        `post ${post.status}`;

    elemento.dataset.id =
        post.id;

    elemento.dataset.semana =
        post.semana;

    elemento.dataset.ordem =
        post.ordem;

    elemento.innerHTML = `
        <div class="post-topo">

            <span class="numero">
                POST ${post.ordem}
            </span>

            <span class="status">
                ${nomeStatus(post.status)}
            </span>

        </div>

        <h3>
            📱 ${escapeHtml(post.titulo)}
        </h3>

        <p>
            ${escapeHtml(post.descricao || "")}
        </p>

        <div class="post-info">

            <span>
                📅 ${formatarData(post.data_publicacao)}
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

    return elemento;
}

/* =====================================================
   NOVO POST
===================================================== */

novoPostBtn.addEventListener(
    "click",
    () => {

        if (!usuarioLogado) {
            return;
        }

        postEditando = null;

        document.getElementById(
            "modalTitulo"
        ).textContent =
            "Novo Post";

        tituloInput.value = "";

        descricaoInput.value = "";

        dataInput.value = "";

        semanaInput.value = "1";

        statusInput.value =
            "planejado";

        modal.classList.add(
            "ativo"
        );
    }
);

/* =====================================================
   FECHAR MODAL
===================================================== */

fecharModal.addEventListener(
    "click",
    () => {

        modal.classList.remove(
            "ativo"
        );
    }
);

modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            modal.classList.remove(
                "ativo"
            );
        }
    }
);

/* =====================================================
   SALVAR POST
===================================================== */

salvarPost.addEventListener(
    "click",
    async () => {

        if (!usuarioLogado) {

            alert(
                "Você precisa estar logado."
            );

            return;
        }

        const titulo =
            tituloInput.value.trim();

        const descricao =
            descricaoInput.value.trim();

        const data =
            dataInput.value;

        const semana =
            Number(
                semanaInput.value
            );

        const status =
            statusInput.value;

        if (titulo === "") {

            alert(
                "Digite o título do post."
            );

            return;
        }

        if (data === "") {

            alert(
                "Escolha a data de publicação."
            );

            return;
        }

        salvarPost.disabled = true;

        salvarPost.textContent =
            "Salvando...";

        /* =============================================
           EDITAR
        ============================================= */

        if (postEditando) {

            const id =
                Number(
                    postEditando.dataset.id
                );

            const { data: postAtualizado, error } =
                await supabaseClient
                    .from("posts")
                    .update({
                        semana: semana,
                        titulo: titulo,
                        descricao:
                            descricao || null,
                        data_publicacao: data,
                        status: status,
                        atualizado_em:
                            new Date().toISOString()
                    })
                    .eq("id", id)
                    .select()
                    .single();

            if (error) {

                console.error(
                    "Erro ao editar:",
                    error
                );

                alert(
                    "Erro ao editar o post."
                );

                salvarPost.disabled = false;

                salvarPost.textContent =
                    "Salvar Post";

                return;
            }

            console.log(
                "Post atualizado:",
                postAtualizado
            );

            modal.classList.remove(
                "ativo"
            );

            postEditando = null;

            await carregarPosts();

            salvarPost.disabled = false;

            salvarPost.textContent =
                "Salvar Post";

            return;
        }

        /* =============================================
           NOVO POST
        ============================================= */

        const { data: postsDaSemana, error: erroBusca } =
            await supabaseClient
                .from("posts")
                .select("ordem")
                .eq("semana", semana)
                .order("ordem", {
                    ascending: false
                })
                .limit(1);

        if (erroBusca) {

            console.error(
                "Erro ao verificar ordem:",
                erroBusca
            );

            alert(
                "Erro ao preparar o novo post."
            );

            salvarPost.disabled = false;

            salvarPost.textContent =
                "Salvar Post";

            return;
        }

        const ultimaOrdem =
            postsDaSemana.length > 0
                ? postsDaSemana[0].ordem
                : 0;

        const novaOrdem =
            ultimaOrdem + 1;

        if (novaOrdem > 3) {

            alert(
                "Essa semana já possui 3 posts."
            );

            salvarPost.disabled = false;

            salvarPost.textContent =
                "Salvar Post";

            return;
        }

        const { data: novoPost, error } =
            await supabaseClient
                .from("posts")
                .insert({
                    semana: semana,
                    titulo: titulo,
                    descricao:
                        descricao || null,
                    data_publicacao: data,
                    status: status,
                    ordem: novaOrdem
                })
                .select()
                .single();

        if (error) {

            console.error(
                "Erro ao criar post:",
                error
            );

            alert(
                "Erro ao salvar o post."
            );

            salvarPost.disabled = false;

            salvarPost.textContent =
                "Salvar Post";

            return;
        }

        console.log(
            "Novo post criado:",
            novoPost
        );

        modal.classList.remove(
            "ativo"
        );

        await carregarPosts();

        salvarPost.disabled = false;

        salvarPost.textContent =
            "Salvar Post";
    }
);

/* =====================================================
   CONFIGURAR BOTÕES
===================================================== */

function configurarBotoes(post) {

    const publicar =
        post.querySelector(
            ".publicar"
        );

    const editar =
        post.querySelector(
            ".editar"
        );

    const excluir =
        post.querySelector(
            ".excluir"
        );

    publicar.style.display =
        usuarioLogado
            ? "inline-block"
            : "none";

    editar.style.display =
        usuarioLogado
            ? "inline-block"
            : "none";

    excluir.style.display =
        usuarioLogado
            ? "inline-block"
            : "none";

    /* =============================================
       PUBLICAR
    ============================================= */

    publicar.addEventListener(
        "click",
        async () => {

            if (!usuarioLogado) {
                return;
            }

            const id =
                Number(
                    post.dataset.id
                );

            publicar.disabled = true;

            const { error } =
                await supabaseClient
                    .from("posts")
                    .update({
                        status: "publicado",
                        atualizado_em:
                            new Date().toISOString()
                    })
                    .eq("id", id);

            publicar.disabled = false;

            if (error) {

                console.error(
                    "Erro ao publicar:",
                    error
                );

                alert(
                    "Erro ao publicar o post."
                );

                return;
            }

            await carregarPosts();
        }
    );

    /* =============================================
       EDITAR
    ============================================= */

    editar.addEventListener(
        "click",
        () => {

            if (!usuarioLogado) {
                return;
            }

            postEditando =
                post;

            document.getElementById(
                "modalTitulo"
            ).textContent =
                "Editar Post";

            tituloInput.value =
                post.querySelector(
                    "h3"
                )
                .textContent
                .replace(
                    "📱 ",
                    ""
                )
                .trim();

            descricaoInput.value =
                post.querySelector(
                    "p"
                ).textContent;

            semanaInput.value =
                post.dataset.semana;

            if (
                post.classList.contains(
                    "publicado"
                )
            ) {

                statusInput.value =
                    "publicado";

            } else if (
                post.classList.contains(
                    "producao"
                )
            ) {

                statusInput.value =
                    "producao";

            } else {

                statusInput.value =
                    "planejado";
            }

            const dataBanco =
                encontrarDataNoPost(
                    post
                );

            dataInput.value =
                dataBanco;

            modal.classList.add(
                "ativo"
            );
        }
    );

    /* =============================================
       EXCLUIR
    ============================================= */

    excluir.addEventListener(
        "click",
        async () => {

            if (!usuarioLogado) {
                return;
            }

            const confirmar =
                confirm(
                    "Deseja excluir este post?"
                );

            if (!confirmar) {
                return;
            }

            const id =
                Number(
                    post.dataset.id
                );

            excluir.disabled = true;

            const { error } =
                await supabaseClient
                    .from("posts")
                    .delete()
                    .eq("id", id);

            excluir.disabled = false;

            if (error) {

                console.error(
                    "Erro ao excluir:",
                    error
                );

                alert(
                    "Erro ao excluir o post."
                );

                return;
            }

            await reorganizarOrdens(
                Number(post.dataset.semana)
            );

            await carregarPosts();
        }
    );
}

/* =====================================================
   REORGANIZAR ORDEM
===================================================== */

async function reorganizarOrdens(
    semana
) {

    const { data: posts, error } =
        await supabaseClient
            .from("posts")
            .select("id")
            .eq("semana", semana)
            .order("data_publicacao", {
                ascending: true
            })
            .order("id", {
                ascending: true
            });

    if (error) {

        console.error(
            "Erro ao reorganizar:",
            error
        );

        return;
    }

    for (
        let i = 0;
        i < posts.length;
        i++
    ) {

        await supabaseClient
            .from("posts")
            .update({
                ordem: i + 1,
                atualizado_em:
                    new Date().toISOString()
            })
            .eq(
                "id",
                posts[i].id
            );
    }
}

/* =====================================================
   STATUS
===================================================== */

function nomeStatus(status) {

    if (
        status === "planejado"
    ) {
        return "Planejado";
    }

    if (
        status === "producao"
    ) {
        return "Em produção";
    }

    if (
        status === "publicado"
    ) {
        return "Publicado";
    }

    return status;
}

/* =====================================================
   FORMATAR DATA
===================================================== */

function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes =
        data.split("-");

    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]) - 1;

    const dia =
        Number(partes[2]);

    const dataObj =
        new Date(
            ano,
            mes,
            dia
        );

    const diasSemana = [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado"
    ];

    const diaSemana =
        diasSemana[
            dataObj.getDay()
        ];

    return `${partes[2]}/${partes[1]}/${partes[0]} — ${diaSemana}`;
}

/* =====================================================
   RECUPERAR DATA DO POST
===================================================== */

function encontrarDataNoPost(post) {

    const texto =
        post.querySelector(
            ".post-info span"
        ).textContent
        .replace("📅 ", "")
        .trim();

    const partes =
        texto
            .split(" — ")[0]
            .split("/");

    if (
        partes.length !== 3
    ) {
        return "";
    }

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

/* =====================================================
   ESCAPAR HTML
===================================================== */

function escapeHtml(texto) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        texto;

    return div.innerHTML;
}

/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async function iniciar() {

    await verificarSessao();

    await carregarPosts();
}

iniciar();