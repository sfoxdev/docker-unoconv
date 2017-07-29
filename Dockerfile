#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

FROM node:slim
#FROM node:alpine

MAINTAINER SFox Lviv <sfox.lviv@gmail.com>

ENV DEBIAN_FRONTEND=noninteractive \
    SERVER_PORT=3000 \
    PAYLOAD_MAX_SIZE=1048576 \
    # Set default locale for the environment
    LC_ALL=C.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8

# Adds backports
RUN awk '$1 ~ "^deb" { $3 = $3 "-backports"; print; exit }' /etc/apt/sources.list > /etc/apt/sources.list.d/backports.list

# Installs git and unoconv
RUN apt-get update && \
    apt-get -t jessie-backports install -y git unoconv mc \
    && apt-get clean autoclean \
    && apt-get autoremove --yes \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && git clone https://github.com/zrrrzzt/tfk-api-unoconv.git /opt/unoconvservice \
    && cd /opt/unoconvservice \
    && npm install --production

ADD update/ /opt/unoconvservice

# Change working directory
WORKDIR /opt/unoconvservice

VOLUME ["/opt/unoconvservice/status"]

EXPOSE 3000

ENTRYPOINT /usr/bin/unoconv --listener --server=0.0.0.0 --port=2002 & node standalone.js
