// Adapted from https://github.com/cloud-custodian/cel-python/blob/master/tools/mkgherkin.go

package main

/*
    Converts Textproto (or protobuf) SimpleTest documents into json so it can be
	loaded by protobuf-es classes.

    See go doc github.com/google/cel-spec/proto/test/v1/testpb SimpleTest
*/

import (
	"fmt"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"

	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/encoding/prototext"

	spb "cel.dev/expr/proto/test/v1/testpb"

	// The following are needed to link in these proto libraries
	// which are needed dynamically, despite not being explicitly
	// used in the Go source.
	_ "cel.dev/expr/proto/test/v1/proto2/test_all_types"
	_ "cel.dev/expr/proto/test/v1/proto3/test_all_types"
)

func parseSimpleFile(filename string) (*spb.SimpleTestFile, error) {
	bytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var pb spb.SimpleTestFile
	err = prototext.Unmarshal(bytes, &pb)
	if err != nil {
		return nil, err
	}
	return &pb, nil
}

var json_formatter = protojson.MarshalOptions{
	Multiline:       true,
	UseProtoNames:   false,
	EmitUnpopulated: false,
}

func json_testfile(testFile *spb.SimpleTestFile) {
	jsonString, _ := json_formatter.Marshal(testFile)
	filename := fmt.Sprintf("%s.json", testFile.Name)
	ioutil.WriteFile(filepath.Join("testdata", filename), jsonString, os.ModePerm)
}

func globMatchFiles(root, ext string) []string {
	var a []string
	filepath.WalkDir(root, func(s string, d fs.DirEntry, e error) error {
		if e != nil {
			return e
		}
		if filepath.Ext(d.Name()) == ext {
			a = append(a, s)
		}
		return nil
	})
	return a
}

func main() {
	arr := globMatchFiles("testdata", ".textproto")

	for i := 0; i < len(arr); i++ {
		input_file := arr[i]
		fmt.Fprintf(os.Stderr, "Writing %v\n", input_file)
		pb, err := parseSimpleFile(input_file)
		if err != nil {
			panic(err)
		}
		json_testfile(pb)
	}
}
