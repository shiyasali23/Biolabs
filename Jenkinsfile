pipeline {
    agent any

    environment {
        EC2_IP = '3.79.96.57'
        REPO_NAME = 'Biolabs'
        GIT_CREDENTIALS = 'github-credentials'
        SSH_CREDENTIALS = 'aws-biolabs-key-file'  // SSH Username with private key credential id
    }

    parameters {
        booleanParam(name: 'DRY_RUN', defaultValue: true, description: 'Run the pipeline in dry run mode')
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                git credentialsId: "${GIT_CREDENTIALS}", 
                    url: 'https://github.com/shiyasali23/Biolabs.git', 
                    branch: 'master'
            }
        }

        stage('Test SSH Connection') {
            steps {
                sshagent(credentials: ["${SSH_CREDENTIALS}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'echo SSH connection successful'
                    """
                }
            }
        }
        
        stage('Deploy to EC2') {
            when {
                expression { return params.DRY_RUN == false }
            }
            steps {
                sshagent(credentials: ["${SSH_CREDENTIALS}"]) {
                    sh """
                        echo "Copying files to EC2..."
                        scp -o StrictHostKeyChecking=no -r \\
                            ./intelligence \\
                            docker-compose.intell.yml \\
                            nginx \\
                            ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/${REPO_NAME}/
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
    }
}
