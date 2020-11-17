## LMM - now - Backend

O tema proposto para a disciplina Projeto Integrador do semestre 2020.1 foi baseado em um projeto iniciado no ano de 2019, o qual visava mensurar o consumo de energia do Laboratório de Montagem Mecatrônica (LMM), no Departamento de Automação e Sistemas (DAS). Para este semestre, a ideia proposta foi criar uma plataforma \textit{web}, livre de custos, em que sejam disponibilizadas as informações de tensão, corrente, potências e energia consumidas durante períodos de tempo definidos pelo usuário. A ideia é que seja criada uma interface mais flexível e escalável fato que, segundo o cliente, não ocorria até então na antiga plataforma utilizada. O âmbito de \textit{Internet of Things} (IoT) para aplicações similares tem se mostrado como solução, entregando bons resultados, e por isso, o grupo utilizou-se de plataformas, linguagens de programação e protocolos de comunicação frequentemente utilizados nessa área. O módulo de aquisição das informações utilizado foi o ESP32, que em conjunto com o protocolo de comunicação MQTT tornou possível armazenar as informações de forma simples e rápida no banco de dados não relacional MongoDB. Para o desenvolvimento do back-end, o runtime environment Node.JS foi selecionado, o qual é utilizado juntamente com o banco de dados, o ESP32 e o front-end desenvolvido com a biblioteca ReactJS, para a coordenação do funcionamento da aplicação. Após várias reuniões com o cliente e com o coordenador do projeto, foi atingido um resultado satisfatório, em que a plataforma apresenta-se não só funcional, como traz a possibilidade de expansão para outros laboratórios da universidade, de forma simples, barata e de fácil aplicabilidade. Além disso, foram implementadas novas features na aplicação, como a possibilidade de cadastro de usuários para acessar a plataforma, divisão dos módulos de exibição de gráficos por laboratório e por ponto de medição, e ativação ou desativação do dispositivo de medição por parte do usuário. O cliente mostrou-se realizado com o resultado obtido e o orientador do projeto ressaltou o quão importante foi o trabalho para o departamento, e assim, discutiu-se sobre futuras melhorias no projeto. O backend desse projeto pode ser encontrado [aqui](https://github.com/RhannaAuler/MongoMQTT).

Esse projeto consiste da parte de back end do site: [https://lmm-ufsc.netlify.app/](https://lmm-ufsc.netlify.app/). Os arquivos do front end encontram-se em: [https://github.com/marinastavares/projeto-pi-react](https://github.com/marinastavares/projeto-pi-react)

## Requisitos

- Node versão 10.16.3+;
- [NPM (Node Package Manager)](https://www.npmjs.com/).

## Rodar o projeto

Para rodar o projeto é necessário primeiramente clonar esse repositário, entrar na pasta do diretório, e utilizar o comando


```
node src/index.js
```


Para rodar a parte de recebimento de dados do broker e salvamento no banco de dados, utilizar o comando

```
node sub.js
```
