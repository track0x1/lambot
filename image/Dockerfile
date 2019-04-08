FROM node:10-slim

RUN apt-get update && \
    apt-get install -y sudo git curl bash jq python build-essential

# install pip/aws-cli
RUN wget "https://bootstrap.pypa.io/get-pip.py" -O /tmp/get-pip.py \
    && python /tmp/get-pip.py \
    && pip install awscli \
    && rm -fr /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /tmp/build

RUN chown -R node:node /tmp/build

USER node

COPY entry.sh utilities.sh /tmp/build/

CMD ["/bin/bash", "-c", "./entry.sh"]
