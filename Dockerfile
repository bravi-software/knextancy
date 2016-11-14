FROM cusspvz/node:0.12.7

# installs waitforit
RUN wget -q -O /usr/local/bin/waitforit https://github.com/maxcnunes/waitforit/releases/download/v1.2.2/waitforit-linux_amd64 \
    && chmod +x /usr/local/bin/waitforit

COPY . /app
RUN npm install --unsafe-perm

CMD [ "npm", "start" ]
