library("dplyr")
library("lubridate")
library("TSstudio")
library("factoextra")
library("hms")

path <- "data/my_stream.csv"
df <- read.csv(path, header = TRUE, sep = ",")
df[df == "undefined" | is.na(df) | df == NULL | df == NaN] <- 0

df$date <- ymd_hms(df$date, tz = "UTC", locale = Sys.getlocale("LC_TIME"))
df$time <- df$date + df$time
df$time <- as_hms(df$time)
df$date <- as.Date(df$date)
df$date <- factor(df$date)

str(df)
print(head(df))

min_date <- min(as.Date(df$date))
max_date <- max(as.Date(df$date))
start <- c(year(min_date), month(min_date), day(min_date))
end <- c(year(max_date), month(max_date), day(max_date))

run_test = df %>% filter(date == "2021-06-09")
tms <- ts(run_test)
# ts_info(tms)
# print(ts_plot(tms[, "velocity_smooth"]))
smooth_ts = smooth.spline(tms[, "velocity_smooth"], spar = 0.3, all.knots = FALSE)

# print(plot(smooth_ts))
peaks = pracma::findpeaks(smooth_ts$y, sortstr = TRUE)
# print(peaks)
# print(ts_cor(tms[, "velocity_smooth"]))

# Clustering
# sc_df <- scale(df[, 3:ncol(df)])
sc_df <- scale(run_test[, c("distance", "velocity_smooth")])

# dist_df <- dist(sc_df)


clust <- kmeans(sc_df, centers = 3)

coude <- fviz_nbclust(sc_df, kmeans, method = "wss")
print(coude)
print(fviz_cluster(clust, data = sc_df, geom = "point"))
# print(ts_plot(tms[, "distance"]))