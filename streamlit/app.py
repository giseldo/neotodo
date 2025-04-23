
import streamlit as st
import sqlite3

# Banco de Dados
def conectar():
    conn = sqlite3.connect('tarefas.db')
    return conn

def criar_banco():
    conn = conectar()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            prioridade TEXT,
            coluna TEXT
        )
    ''')
    conn.commit()
    conn.close()

def adicionar_tarefa(titulo, descricao, prioridade, coluna):
    conn = conectar()
    conn.execute('INSERT INTO tarefas (titulo, descricao, prioridade, coluna) VALUES (?, ?, ?, ?)',
                 (titulo, descricao, prioridade, coluna))
    conn.commit()
    conn.close()

def listar_tarefas():
    conn = conectar()
    tarefas = conn.execute('SELECT * FROM tarefas').fetchall()
    conn.close()
    return tarefas

def deletar_tarefa(id):
    conn = conectar()
    conn.execute('DELETE FROM tarefas WHERE id = ?', (id,))
    conn.commit()
    conn.close()

def editar_tarefa(id, novo_titulo, nova_descricao, nova_prioridade, nova_coluna):
    conn = conectar()
    conn.execute('UPDATE tarefas SET titulo=?, descricao=?, prioridade=?, coluna=? WHERE id=?',
                 (novo_titulo, nova_descricao, nova_prioridade, nova_coluna, id))
    conn.commit()
    conn.close()

# Estilo de prioridade
def estilo_prioridade(prioridade):
    if prioridade == "Alta":
        return "🔴", "red"
    elif prioridade == "Média":
        return "🟠", "orange"
    else:
        return "🟢", "green"

# Inicialização
criar_banco()
st.set_page_config(page_title="Quadro Kanban Completo", layout="wide")

# Título
st.title("📋 Quadro Kanban - Streamlit Completo")

# Formulário para adicionar nova tarefa
with st.form(key='nova_tarefa'):
    st.subheader("Adicionar Nova Tarefa")
    titulo = st.text_input("Título")
    descricao = st.text_area("Descrição")
    prioridade = st.selectbox("Prioridade", ["Baixa", "Média", "Alta"])
    coluna = st.selectbox("Coluna", ["A Fazer", "Em Andamento", "Concluído"])
    enviar = st.form_submit_button("Adicionar")

    if enviar and titulo:
        adicionar_tarefa(titulo, descricao, prioridade, coluna)
        st.success("✅ Tarefa adicionada!")
        st.experimental_rerun()

st.markdown("---")

# Organização das tarefas em colunas
tarefas = listar_tarefas()
col1, col2, col3 = st.columns(3)

# Função para exibir e permitir edição/exclusão da tarefa
def exibir_tarefa(tarefa):
    emoji, cor = estilo_prioridade(tarefa[3])
    st.markdown(f"<h5 style='color:{cor};'>{emoji} {tarefa[1]}</h5>", unsafe_allow_html=True)
    if tarefa[2]:
        st.caption(tarefa[2])
    col_editar, col_excluir = st.columns([1, 1])
    if col_editar.button("✏️ Editar", key=f"edit_{tarefa[0]}"):
        with st.form(key=f"form_edit_{tarefa[0]}"):
            novo_titulo = st.text_input("Novo Título", value=tarefa[1])
            nova_descricao = st.text_area("Nova Descrição", value=tarefa[2])
            nova_prioridade = st.selectbox("Nova Prioridade", ["Baixa", "Média", "Alta"], index=["Baixa", "Média", "Alta"].index(tarefa[3]))
            nova_coluna = st.selectbox("Nova Coluna", ["A Fazer", "Em Andamento", "Concluído"], index=["A Fazer", "Em Andamento", "Concluído"].index(tarefa[4]))
            salvar = st.form_submit_button("Salvar Alterações")
            if salvar:
                editar_tarefa(tarefa[0], novo_titulo, nova_descricao, nova_prioridade, nova_coluna)
                st.success("✅ Tarefa atualizada!")
                st.experimental_rerun()
    if col_excluir.button("🗑️ Excluir", key=f"del_{tarefa[0]}"):
        deletar_tarefa(tarefa[0])
        st.warning("⚠️ Tarefa excluída.")
        st.experimental_rerun()

# Listar tarefas
for tarefa in tarefas:
    with (col1 if tarefa[4] == "A Fazer" else col2 if tarefa[4] == "Em Andamento" else col3):
        with st.container(border=True):
            exibir_tarefa(tarefa)

st.markdown("---")
st.caption("Aplicação Kanban Streamlit Completa com SQLite.")
