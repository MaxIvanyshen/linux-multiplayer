FROM alpine:3.18

RUN apk add --no-cache openssh-server bash curl wget git vim nano htop neofetch figlet coreutils

RUN ssh-keygen -A && \
    mkdir -p /root/.ssh && \
    sed -i 's/#PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

RUN echo "sandbox" > /etc/hostname

RUN sed -i 's#/bin/ash#/bin/bash#' /etc/passwd

RUN printf '#!/bin/bash\nprintf "\\033[38;5;139m████ TOKYO NIGHT TERMINAL ████\\033[0m\\n"\n' > /usr/local/bin/welcome && chmod +x /usr/local/bin/welcome

RUN printf 'export TERM=xterm-256color\nexport PS1="\\[\\033[38;5;139m\\]┌─[\\[\\033[38;5;183m\\]\\u\\[\\033[38;5;139m\\]@sandbox]-[\\[\\033[38;5;183m\\]\\w\\[\\033[38;5;139m\\]]\\n└─$ \\[\\033[0m\\]"\nwelcome\n' > /root/.bashrc

# Make sure SSH always starts a login shell
RUN cp /root/.bashrc /root/.bash_profile && \
    cp /root/.bashrc /root/.profile && \
    echo 'source ~/.bashrc' >> /etc/profile

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]

