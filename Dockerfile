FROM node:0.10.32-onbuild

RUN apt-get update -q && apt-get install -yq wget

# waitforit
RUN wget -q -O /tmp/waitforit.tar.gz https://github.com/maxcnunes/waitforit/releases/download/v1.1.0/linux.tar \
    && tar -zxvf /tmp/waitforit.tar.gz -C /usr/local/bin \
    && rm /tmp/waitforit.tar.gz
