FROM node:0.10.32-onbuild

RUN apt-get update -q && apt-get install -yq wget

# installs waitforit
RUN wget -q -O /usr/local/bin/waitforit https://github.com/maxcnunes/waitforit/releases/download/v1.2.2/waitforit-linux_amd64 \
    && chmod +x /usr/local/bin/waitforit
