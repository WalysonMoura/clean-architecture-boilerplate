# Use a imagem base oficial do Node.js
FROM node:18-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie o package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Compile o TypeScript para JavaScript
RUN npm run build

# Exponha a porta que a aplicação irá rodar
EXPOSE 3333

# Defina o comando para rodar a aplicação
CMD ["node", "dist/main.js"]
