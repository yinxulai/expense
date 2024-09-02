FROM ubuntu:22.04

# 指定工作目录
WORKDIR /workspace

# 声明 ssh key
VOLUME ["/root/.ssh"]

# 构建过程默认使用 bash
SHELL ["/bin/bash", "-c"]

# 基础命令工具
RUN apt-get update -y
RUN apt-get install curl zsh git -y

# 使用 zsh 作为默认
RUN chsh -s /bin/zsh

# oh-my-zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 安装 nvm + node
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN source ~/.zshrc && nvm install 22 --default

ENTRYPOINT ["sleep", "infinity"]
