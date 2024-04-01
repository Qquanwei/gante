FROM alibaba-cloud-linux-3-registry.cn-hangzhou.cr.aliyuncs.com/alinux3/node:16.17.1-nslt
COPY --chown=node:node ./ /gante/
WORKDIR /gante/
RUN npm i --registry=https://registry.npmmirror.com
RUN npm run build
ENV GANTE_MONG_ADDR=mongodb://root:example@localhost:27017/gante_store?authSource=admin
CMD [ "npm", "run", "start" ]
