#include <QApplication>
#include <QWidget>
#include <QLineEdit>
#include <QPushButton>
#include <QProgressBar>
#include <QVBoxLayout>
#include <QLabel>
#include <QProcess>
#include <QStandardPaths>
#include <QDebug>

class Downloader : public QWidget {
    Q_OBJECT

public:
    Downloader(QWidget *parent = nullptr) : QWidget(parent) {
        auto *layout = new QVBoxLayout(this);

        urlInput = new QLineEdit(this);
        urlInput->setPlaceholderText("Enter YouTube URL...");
        layout->addWidget(urlInput);

        statusLabel = new QLabel("Status: Waiting", this);
        layout->addWidget(statusLabel);

        progressBar = new QProgressBar(this);
        progressBar->setRange(0, 100);
        layout->addWidget(progressBar);

        downloadButton = new QPushButton("Download", this);
        layout->addWidget(downloadButton);

        connect(downloadButton, &QPushButton::clicked, this, &Downloader::startDownload);
    }

private slots:
    void startDownload() {
        QString url = urlInput->text().trimmed();
        if (url.isEmpty()) {
            statusLabel->setText("Please enter a URL.");
            return;
        }

        QString downloadsPath = QStandardPaths::writableLocation(QStandardPaths::DownloadLocation);
        QStringList arguments = {
            "-f", "best",
            "-o", downloadsPath + "/%(title)s.%(ext)s",
            url
        };

        process = new QProcess(this);
        connect(process, &QProcess::readyReadStandardOutput, this, &Downloader::readOutput);
        connect(process, &QProcess::readyReadStandardError, this, &Downloader::readOutput);
        connect(process, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished), this, [=]() {
            statusLabel->setText("✅ Download finished.");
            progressBar->setValue(100);
        });

        statusLabel->setText("Downloading...");
        process->start("yt-dlp", arguments);
    }

    void readOutput() {
        QByteArray output = process->readAllStandardOutput() + process->readAllStandardError();
        QString text(output);
        QRegularExpression regex(R"((\d{1,3}\.\d)%)");
        QRegularExpressionMatch match = regex.match(text);
        if (match.hasMatch()) {
            double percent = match.captured(1).toDouble();
            progressBar->setValue(static_cast<int>(percent));
            statusLabel->setText("Downloading... " + QString::number(percent, 'f', 1) + "%");
        }
    }

private:
    QLineEdit *urlInput;
    QLabel *statusLabel;
    QProgressBar *progressBar;
    QPushButton *downloadButton;
    QProcess *process;
};

#include "main.moc"

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    Downloader window;
    window.setWindowTitle("YouTube Downloader (C++ Qt)");
    window.resize(400, 200);
    window.show();

    return app.exec();
}
