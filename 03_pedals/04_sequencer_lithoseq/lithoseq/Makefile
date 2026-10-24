CC      ?= gcc
CFLAGS  ?= -O2 -Wall -Wextra -std=c11
BUILD    = build

CORE_SRC = core/pipeline.c core/metrics.c core/playhead.c core/mapping.c
APP_SRC  = app/patterns.c app/proto.c app/midi.c

.PHONY: all test sim clean

all: test sim

$(BUILD):
	mkdir -p $(BUILD)

$(BUILD)/test_core: $(CORE_SRC) app/patterns.c tests/test_core.c | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $^

$(BUILD)/test_midi: $(CORE_SRC) app/patterns.c app/midi.c tests/test_midi.c | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $^

$(BUILD)/lithoseq_sim: $(CORE_SRC) $(APP_SRC) app/sim_main.c | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $^

test: $(BUILD)/test_core $(BUILD)/test_midi
	./$(BUILD)/test_core
	./$(BUILD)/test_midi

sim: $(BUILD)/lithoseq_sim

clean:
	rm -rf $(BUILD)
